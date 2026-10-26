#!/usr/bin/env python3
"""Inventory source headings without rewriting article content."""
import json
import re
from collections import Counter
import sync_content as sync

CHAPTERS = {'1', '4', '5', '16', '56'}
ALTERNATE = {'2', '3'}
STRUCTURE = {
 '14': '第一节“一、‘田氏代齐’与‘三家分晋’的历史概述”使用引用块，未进入目录。',
 '31': '开头“複合動詞ノ一部”使用引用块，未进入目录。',
 '44': '开头“引言”是普通段落，未进入目录。',
 '55': '开头“前言”使用引用块，未进入目录；第一章“一 刘家风云”存在。',
}

def inventory():
    rows = []
    for e in sorted(sync.discover_entries(False), key=lambda x:int(x['id'])):
        row = dict(id=e['id'], title=e['title'], source=e['source'], type=e['type'], status='未发现首标题替换问题', note='', firstHeading='')
        if e['type'] == 'markdown':
            text = (sync.ROOT/e['source']).read_text(encoding='utf-8')
            body = sync.parse_front_matter(text)[1]
            first = next((line.strip() for line in body.splitlines() if line.strip()), '')
            heading = re.search(r'^#{1,6}\s+(.+)', body, re.M)
            row['firstHeading'] = heading[1] if heading else ''
            if e['id'] in CHAPTERS | ALTERNATE:
                row['status'] = '首节标题被替换' if e['id'] in CHAPTERS else '副标题被替换'
                row['note'] = first + '；源文件保留该标题和正文，渲染规则已修正。'
            elif e['id'] in STRUCTURE:
                row['status'] = '章节格式待确认'
                row['note'] = STRUCTURE[e['id']]
            elif not heading:
                row['status'] = '无 Markdown 章节标题'
                row['note'] = '日记、表格或列表等无章节结构的内容；不能据此认定丢失章节。'
        else:
            row['status'] = '附件需人工核对'
            row['note'] = '附件未经过 Markdown 首标题替换规则；未逐页核对附件内容完整性。'
        rows.append(row)
    return rows

def main():
    rows = inventory()
    folder = sync.ROOT/'reports'
    folder.mkdir(exist_ok=True)
    (folder/'blog-audit.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
    lines = ['# Blog 文章结构检查清单', '', '范围：60 篇索引条目。核对 Markdown 源文件开头、标题层级及首标题渲染规则。本文不将“没有章节标题”等同于“正文缺失”；没有原始导出对照，无法确认原始内容完整性。', '', '## 首节标题', '', '| 编号 | 文章 | 源文件首节 |', '| --- | --- | --- |']
    for r in rows:
        if r['id'] in CHAPTERS:
            lines.append(f"| [{r['id']}](http://127.0.0.1:8765/blog/{r['id']}) | {r['title']} | {r['firstHeading']} |")
    lines += ['', '这 5 篇的首节标题和正文均存在于源文件。首标题渲染规则将章节名误作文章名，导致章节名不显示；对应标题可由源文件直接呈现，不需要补写正文。', '', '## 副标题', '']
    for r in rows:
        if r['id'] in ALTERNATE:lines.append(f"- {r['id']} · {r['title']}：{r['firstHeading']}。源文件副标题存在。")
    lines += ['', '## 章节格式待确认', '']
    for r in rows:
        if r['id'] in STRUCTURE:lines.append(f"- [{r['id']} · {r['title']}](http://127.0.0.1:8765/blog/{r['id']})：{r['note']}")
    lines += ['', '## 全部条目', '', '| 编号 | 文章 | 检查结果 |', '| --- | --- | --- |']
    for r in rows:lines.append(f"| {r['id']} | {r['title'].replace('|',' / ')} | {r['status']} |")
    (folder/'blog-audit.md').write_text('\n'.join(lines)+'\n')
    print(dict(Counter(r['status'] for r in rows)))

if __name__=='__main__':main()
