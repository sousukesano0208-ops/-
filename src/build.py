"""src/ のファイルをまとめて、リポジトリ直下の index.html（GitHub Pages 用）を作る。
使い方:  python3 src/build.py
"""
import pathlib
src = pathlib.Path(__file__).resolve().parent
root = src.parent
t = (src / 'template.html').read_text(encoding='utf-8')
for key, name in [('/*ENGINE*/', 'engine.js'), ('/*STAGES*/', 'stages.js'), ('/*MAIN*/', 'main.js')]:
    t = t.replace(key, (src / name).read_text(encoding='utf-8'))
head = ('<!doctype html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n')
# <title> などは template.html の先頭にあるので head に含める
cut = t.index('<div id="app">')
html = head + t[:cut] + '</head>\n<body>\n' + t[cut:] + '\n</body>\n</html>\n'
(root / 'index.html').write_text(html, encoding='utf-8')
print('index.html を作成しました', len(html), 'bytes')
