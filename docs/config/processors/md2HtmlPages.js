var _ = require('lodash');
var marked = require('marked');
var renderer = new marked.Renderer();

renderer.code = function (code, language) {
    return ['<pre><code class="', /^d2\./.test(code.trim()) ? 'd2-runnable-code-example' : 'd2-code-example', '">', code, '</code></pre>'].join('');
}

module.exports = function md2HtmlPages(log) {
    return {
        $runBefore: ['createNavigationDoc'],
        $process: function (docs) {
            docs = _.forEach(docs, function (doc) {
                if (doc.fileInfo.extension === 'md') {
                    doc.module = doc.fileInfo.relativePath.split('/').slice(-2, -1).pop() || 'default';
                    doc.outputPath = doc.module + '/' + doc.fileInfo.baseName.charAt(0).toUpperCase() + doc.fileInfo.baseName.slice(1).toLowerCase() + '.json';
                    doc.template = 'page.template.json';
                    doc.pageName = doc.fileInfo.baseName.charAt(0).toUpperCase() + doc.fileInfo.baseName.slice(1).toLowerCase().replace(/\_/g, ' ');
                    doc.content = marked(doc.content, {renderer: renderer});
                    doc.name = doc.pageName;
                    doc.pageType = 'documentation';
                }
            });

            return docs;
        }
    };
};
