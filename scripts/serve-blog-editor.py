#!/usr/bin/env python3
"""Loopback-only blog metadata editor. No publication or remote write endpoint."""
import argparse
import datetime as dt
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
from pathlib import Path
import tempfile
import threading
from urllib.parse import unquote, urlparse
import sync_content as sync
from audit_blog import inventory

LOCK = threading.Lock()
FIELDS = {'title','date','categories','selected','tags','summary'}

def revision():
    return hashlib.sha256(sync.METADATA_PATH.read_bytes()).hexdigest()

def snapshot():
    registry = json.loads(sync.METADATA_PATH.read_text())
    return dict(revision=revision(), categories=sync.CATEGORIES, articles=registry['articles'], audit=inventory())

def atomic_write(path, data):
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as temp:
        temp.write(data)
        temp_path = Path(temp.name)
    temp_path.replace(path)

def validate(data):
    if set(data) != FIELDS:raise ValueError('字段不完整或包含不支持的字段。')
    for key, limit in [('title',500),('summary',10000),('date',10)]:
        if not isinstance(data[key],str) or len(data[key])>limit:raise ValueError(f'{key} 格式不正确。')
        data[key]=data[key].strip()
    if not data['title']:raise ValueError('标题不能为空。')
    if dt.date.fromisoformat(data['date']).isoformat()!=data['date']:raise ValueError('日期请使用 YYYY-MM-DD。')
    categories=data['categories']
    if not isinstance(categories,list) or not categories or any(not isinstance(c,str) or c not in sync.CATEGORY_NAMES or c=='selected' for c in categories):raise ValueError('请选择至少一个实际分类。')
    data['categories']=list(dict.fromkeys(categories))
    if type(data['selected']) is not bool:raise ValueError('精选标记格式不正确。')
    tags=data['tags']
    if not isinstance(tags,list) or len(tags)>50 or any(not isinstance(t,str) or len(t)>100 for t in tags):raise ValueError('标签格式不正确。')
    data['tags']=list(dict.fromkeys(t.strip() for t in tags if t.strip()))
    return data

class Handler(BaseHTTPRequestHandler):
    def allowed(self):
        hosts={f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}'}
        return self.headers.get('Host') in hosts and self.headers.get('Origin') in {None,*('http://'+h for h in hosts)}

    def respond(self, status, data, mime='application/json; charset=utf-8'):
        content=json.dumps(data,ensure_ascii=False).encode() if isinstance(data,(dict,list)) else data
        self.send_response(status)
        self.send_header('Content-Type',mime)
        self.send_header('Content-Length',str(len(content)))
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self):
        if not self.allowed():return self.respond(403,{'error':'仅限本机编辑台。'})
        path=unquote(urlparse(self.path).path)
        if path=='/api/blog':
            with LOCK:return self.respond(200,snapshot())
        names={'/':'index.html','/editor':'index.html','/editor/':'index.html','/editor/editor.css':'editor.css','/editor/editor.js':'editor.js'}
        if path not in names:return self.respond(404,{'error':'Not found'})
        file=sync.ROOT/'local-editor'/names[path]
        self.respond(200,file.read_bytes(),mimetypes.guess_type(file.name)[0]+'; charset=utf-8')

    def do_PUT(self):
        if not self.allowed():return self.respond(403,{'error':'仅限本机编辑台。'})
        if self.headers.get('Content-Type','').split(';')[0]!='application/json':return self.respond(415,{'error':'需要 JSON 请求。'})
        path=urlparse(self.path).path.split('/')
        if len(path)!=4 or path[1:3]!=['api','blog'] or not path[3].isdigit():return self.respond(404,{'error':'文章不存在。'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if not 0<length<=65536:raise ValueError('请求大小不正确。')
            payload=json.loads(self.rfile.read(length))
            if not isinstance(payload,dict) or set(payload)!={'revision','article'}:raise ValueError('请求格式不正确。')
            data=validate(payload['article'])
        except (ValueError,TypeError,KeyError) as error:return self.respond(400,{'error':str(error)})
        with LOCK:
            if payload['revision']!=revision():return self.respond(409,{'error':'文件已被其他窗口修改。请先保留未保存内容，再重新加载编辑台。'})
            old=sync.METADATA_PATH.read_bytes()
            old_index=sync.OUT_PATH.read_bytes()
            registry=json.loads(old)
            if path[3] not in registry['articles']:return self.respond(404,{'error':'文章不存在。'})
            backup=sync.ROOT/'.cache/blog-editor/backups'
            backup.mkdir(parents=True,exist_ok=True)
            (backup/(dt.datetime.now().strftime('%Y%m%d-%H%M%S-%f')+'.json')).write_bytes(old)
            registry['articles'][path[3]].update(data)
            try:
                atomic_write(sync.METADATA_PATH,(json.dumps(registry,ensure_ascii=False,indent=2)+'\n').encode())
                index={'generatedAt':dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),'categories':sync.CATEGORIES,'entries':sync.discover_entries(False)}
                atomic_write(sync.OUT_PATH,(json.dumps(index,ensure_ascii=False,indent=2)+'\n').encode())
            except Exception:
                atomic_write(sync.METADATA_PATH,old)
                atomic_write(sync.OUT_PATH,old_index)
                return self.respond(500,{'error':'保存失败，文件已恢复。'})
            self.respond(200,snapshot())

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port',type=int,default=8767)
    args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'Blog editor: http://127.0.0.1:{args.port}/editor/',flush=True)
    server.serve_forever()
