// Rebuild Azure Search index
// call: node rebuildIndex.js --ghostExportFile=./export.json --serviceName=ghostblog --indexName=posts --adminKey=ABC --blogUrl=https://ghostblog.ghost.io

var fs = require('fs'),
    https = require('https'),
    argv = require('yargs').argv;

var ghostExportFile = argv.ghostExportFile,
    serviceName = argv.serviceName,
    indexName = argv.indexName,
    adminKey = argv.adminKey,
    blogUrl = argv.blogUrl;
    
var hasError = false;

if (ghostExportFile === undefined || ghostExportFile.length === 0) {
    console.error('ERROR: Specify the path to the Ghost export file using the ghostExportFile argument');
    hasError = true;
}

if (serviceName === undefined || serviceName.length === 0) {
    console.error('ERROR: Specify the name of your Azure Search instance using the serviceName argument');
    hasError = true;
}

if (indexName === undefined || indexName.length === 0) {
    console.error('ERROR: Specify the name of of your index using the indexName argument');
    hasError = true;
}

if (adminKey === undefined || adminKey.length === 0) {
    console.error('ERROR: Specify your Azure Search instance admin key using the adminKey argument');
    hasError = true;
}

if (blogUrl === undefined || blogUrl.length === 0) {
    console.error('ERROR: Specify the URL of your blog (without the trailing slash) using the blogUrl argument');
    hasError = true;
}

if (hasError) {
    console.log();
    console.log('Sample usage:');
    console.log('node rebuildIndex.js --ghostExportFile=./export.json --serviceName=ghostblog --indexName=posts --adminKey=ABC --blogUrl=https://ghostblog.ghost.io');
    process.exit();
}

var ghostPosts = JSON.parse(fs.readFileSync(ghostExportFile, 'utf-8'));

var posts = [];

ghostPosts.db[0].data.posts.forEach(function(post) {
    if (post.status === 'published') {
        posts.push({
            '@search.action': 'mergeOrUpload',
            id: post.uuid,
            title: post.title,
            content: post.html.replace(/<[^>]+>/g, ' '),
            url: blogUrl + '/' + post.slug,
            pubDate: new Date(post.published_at)
        });
    }
});

var requestData = {
    value: posts
};

var requestString = JSON.stringify(requestData);

var request = https.request({
      host: serviceName + '.search.windows.net',
      path: '/indexes/' + indexName + '/docs/index?api-version=2015-02-28',
      method: 'POST',
      headers: {
          'Connection': 'Close',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestString),
          'api-key': adminKey
      },
      secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
      ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
      honorCipherOrder: true
  }, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log('Response: ' + chunk);
    });
    res.on('end', () => {
        console.log('Done');
    })
}).on('error', (e) => {
    console.log(e);
});

request.write(requestString);
request.end();