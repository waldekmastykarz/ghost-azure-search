# Create and build Azure Search index for your Ghost blog

Ghost is a great blogging platform which unfortunately lacks a search capability. Luckily, you can easily push your Ghost blog's content to an Azure Search instance and use it to provide your readers with a search capability.

Following are two node.js scripts that can help you create and build a search index for your Ghost blog.

## Prerequisites

1. Export your Ghost blog content
1. Clone this repository
1. Run `npm i`
1. In your Azure subscription create a new instance of Azure Search and copy the admin key which you will need to configure the index

## Creating the index

The first step is to create the definition of the search index. As a starting point you can use the definition provided in the https://github.com/waldekmastykarz/ghost-azure-search/blob/master/index.json file but feel free to extend it as necessary using the additional information provided at https://msdn.microsoft.com/library/azure/dn798941.aspx?WT.mc_id=m365-0000-wmastyka.

When done run the **createIndex.js** script:

```
node createIndex.js --indexFile=./index.json --serviceName=ghostblog --indexName=posts --adminKey=ABC
```

Following are the arguments that you have to pass:
* **indexFile** - path to the .json file holding the schema of your search index
* **serviceName** - name of your Azure Search instance
* **indexName** - name of the index to be created
* **adminKey** - the admin key to your Azure Search instance

> **Important**: if you want to be able to search on your blog using client-side calls, don't forget to configure CORS for the newly created index on the Azure Management Portal

## Rebuilding the index

The next step is to fill the index with the contents of your Ghost blog so that your readers can search on your blog.

Run the **rebuildIndex.js** script:

```
node rebuildIndex.js --ghostExportFile=./export.json --serviceName=ghostblog --indexName=posts --adminKey=ABC --blogUrl=https://ghostblog.ghost.io
```

Following are the arguments that you have to pass:
* **ghostExportFile** - path to the Ghost export file with the contents of your blog
* **serviceName** - name of your Azure Search instance
* **indexName** - name of the index to be created
* **adminKey** - the admin key to your Azure Search instance
* **blogUrl** - the URL of your blog without the trailing slash, eg. *https://ghostblog.ghost.io*. This URL is used to prepend your blog posts' slugs

Having completed these steps the last thing left for you to do, is to have the search box on your blog call the Azure Search API. More information about it is available on https://msdn.microsoft.com/library/azure/dn798927.aspx?WT.mc_id=m365-0000-wmastyka.
