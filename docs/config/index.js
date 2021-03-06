// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
var path = require('canonical-path');

var Package = require('dgeni').Package;

// Create and export a new Dgeni package called dgeni-example. This package depends upon
// the jsdoc and nunjucks packages defined in the dgeni-packages npm module.
module.exports = new Package('config', [
    require('dgeni-packages/jsdoc'),
    require('dgeni-packages/nunjucks')
])

    .factory(require('./readers/srcFile'))
    .factory(require('./readers/mdFile'))
    .factory(require('./services/transforms/to-boolean'))

    .processor(require('./processors/docsBuilder'))
    .processor(require('./processors/mergeDocs'))
    .processor(require('./processors/groupTags'))
    .processor(require('./processors/createNavigationDoc'))
    .processor(require('./processors/md2HtmlPages'))

    // Configure rendering
    .config(function(templateEngine) {

        // Nunjucks and Angular conflict in their template bindings so change Nunjucks
        templateEngine.config.tags = {
            variableStart: '{$',
            variableEnd: '$}'
        };
    })

    .config(function(parseTagsProcessor, getInjectables) {
        parseTagsProcessor.tagDefinitions = parseTagsProcessor.tagDefinitions.concat(getInjectables(require('./tag-defs')));
    })

    .config(function(templateEngine) {
        templateEngine.filters = templateEngine.filters
            .concat(require('./rendering/filters'));
    })

// Configure our dgeni-example package. We can ask the Dgeni dependency injector
// to provide us with access to services and processors that we wish to configure
    .config(function(log, readFilesProcessor, srcFileFileReader, mdFileFileReader, templateFinder, writeFilesProcessor) {

        // Set logging level
        log.level = 'info';

        readFilesProcessor.fileReaders = [srcFileFileReader, mdFileFileReader];
        // Specify the base path used when resolving relative paths to source and output files
        readFilesProcessor.basePath = path.resolve(__dirname, '../..');

        // Specify collections of source files that should contain the documentation to extract
        readFilesProcessor.sourceFiles = [
            {
                // Process all js files in `src` and its subfolders ...
                include: ['src/**/*.js', 'docs/pages/**/*.md'],
                // ... except for this one!
                exclude: 'src/do-not-read.js',
                // When calculating the relative path to these files use this as the base path.
                // So `src/foo/bar.js` will have relative path of `foo/bar.js`
                basePath: 'src'
            }
        ];

        // Add a folder to search for our own templates to use when rendering docs
        templateFinder.templateFolders.unshift(path.resolve(__dirname, 'templates'));

        // Specify how to match docs to templates.
        // In this case we just use the same static template for all docs
        templateFinder.templatePatterns = [
            '${ doc.template }',
            '${ doc.id }.${ doc.docType }.template.json',
            '${ doc.id }.template.json',
            '${ doc.docType }.template.json',
            'common.template.json',
        ];

        // Specify where the writeFilesProcessor will write our generated doc files
        writeFilesProcessor.outputFolder  = 'docs/app/sources';
    });