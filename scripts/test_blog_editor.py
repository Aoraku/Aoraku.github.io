"""Exercise real editor HTTP persistence against an isolated repository fixture."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
import sync_content as sync

spec=importlib.util.spec_from_file_location('editor',Path(__file__).with_name('serve-blog-editor.py'))
editor=importlib.util.module_from_spec(spec)
spec.loader.exec_module(editor)

class EditorTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory()
        root=Path(cls.temp.name)
        cls.original={key:getattr(sync,key) for key in ['ROOT','BLOG_ROOT','METADATA_PATH','OUT_PATH']}
        sync.ROOT=root;sync.BLOG_ROOT=root/'content/blog';sync.METADATA_PATH=root/'data/blog-metadata.json';sync.OUT_PATH=root/'data/blog-index.json'
        sync.METADATA_PATH.parent.mkdir()
        source=sync.BLOG_ROOT/'essays/杂文/sample/index.md'
        source.parent.mkdir(parents=True)
        source.write_text('---\ntitle: Source title\ndate: 2026-01-01\n---\n## 第一章\n\n正文。\n')
        sync.discover_entries()
        cls.server=editor.ThreadingHTTPServer(('127.0.0.1',0),editor.Handler)
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.url=f'http://127.0.0.1:{cls.server.server_port}'
        cls.client=urllib.request.build_opener(urllib.request.ProxyHandler({}))
        sync.OUT_PATH.write_text(json.dumps({'categories':sync.CATEGORIES,'entries':sync.discover_entries()}))

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown();cls.server.server_close();cls.thread.join()
        for key,value in cls.original.items():setattr(sync,key,value)
        cls.temp.cleanup()

    def request(self,path='/api/blog',payload=None,headers=None):
        req=urllib.request.Request(self.url+path,data=json.dumps(payload).encode() if payload is not None else None,method='PUT' if payload is not None else 'GET',headers={'Content-Type':'application/json',**(headers or {})})
        try:
            with self.client.open(req) as response:return response.status,json.load(response)
        except urllib.error.HTTPError as error:
            with error:return error.code,json.load(error)

    def test_roundtrip_and_guards(self):
        _,before=self.request()
        key=next(iter(before['articles']))
        original=before['articles'][key]
        source=sync.ROOT/original['document'];body=source.read_bytes()
        article={field:copy.deepcopy(original[field]) for field in editor.FIELDS}
        article.update(title='Edited title',date='2026-02-02',categories=['frontier','cst'],selected=True,tags=['数学','AI'],summary='新的推介语')
        request={'revision':before['revision'],'article':article}
        status,after=self.request('/api/blog/'+key,request)
        self.assertEqual(status,200)
        for field in editor.FIELDS:self.assertEqual(after['articles'][key][field],article[field])
        self.assertEqual(after['articles'][key]['document'],original['document'])
        self.assertEqual(source.read_bytes(),body)
        entries=json.loads(sync.OUT_PATH.read_text())['entries']
        self.assertEqual(entries[0]['id'],key)
        self.assertEqual(entries[0]['title'],'Edited title')
        self.assertEqual(entries,sync.discover_entries(False))
        self.assertTrue(list((sync.ROOT/'.cache/blog-editor/backups').glob('*.json')))
        self.assertEqual(self.request('/api/blog/'+key,request)[0],409)
        request['revision']=after['revision']
        for patch in [{'categories':[]},{'categories':['selected']},{'date':'2026-02-30'},{'selected':'true'},{'tags':[0]}]:
            invalid={**request,'article':{**article,**patch}}
            self.assertEqual(self.request('/api/blog/'+key,invalid)[0],400)
        self.assertEqual(self.request('/api/blog/'+key,request,{'Origin':'https://example.com'})[0],403)
        self.assertEqual(self.request(headers={'Host':'example.com'})[0],403)
        self.assertEqual(self.request('/.git/config')[0],404)
        self.assertEqual(self.request()[1]['revision'],after['revision'])

if __name__=='__main__':unittest.main()
