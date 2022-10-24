---
meta:
  title: Documentation | Pressunto
---

## Documentation

This page describes how to get the most of Pressunto and how different pages work together.

### Login

This is the first page that you will see when you enter the platform. It presents the different login options to log in with github, along with a privacy and data transparency disclaimer. The purpose of the disclaimer is to inform you of how the data you are about to give is going to be used. You can select to give access to only public repos or to repos private and public. When you click the login button, you will be redirected to github oauth login screen, and if successfull the project list page.

### Projects

In this page you will see the list of projects you have created in the platform, each one pointing to a specific github repo. If you don't have any project you can click the big button to go to the new project page

### New Project

Here you can select a github repo among the ones you have write access to, select a branch and name it. We call this three pieces of information together a _'project'_. When you click save a blank configuration file will be created in your repo if none existed and you will be redirected to the project details screen.

### Project Detail

Here you will see the project layout with the left sidebar and the content lists. The sidebar contains link to all your available collections, as well as links to other sections of interest, like information documents about the platform, a full view of your repo source and the project settings

### Collections

The **Collections** list is the first one you will see when you enter a project details.

Collections map to folders in your repository that list the markdown files of that folder as posts, but not the ones in subfolders.

From the collection list you can access the collection detail and the collection settings for every collection.

Collection are saved in your configuration file with this data structure:

```json
{
  "id": "blog",
  "name": "Blog",
  "route": "/content/blog",
  "template": "blog",
}
```

- The **id** field is created automatically as a slug created from the `name` field.
- The **name** field is the label that is displayed in the collections list.
- The **route** field contains the route of the folder inside your repository that this collections points to.
- The optional **template** field contains the id of the template associated with this collection, if any.

### Collection Detail

This screen lists all the posts in the collection by their saved title in the post frontmatter. From here you can access the post editor for each post or create a new one.

#### Collection reorder

You can also reorder the post list. This works by writing a numeric `order` attribute to the frontmatter of every post in the list. This is saved all in only one commit to your repository. You can then later use this attribute in your website to sort the blog posts.

### Post Detail

This screen contiains the main functionality for the platform. Here you can edit your post content and frontmatter. Every post in a collection will have the fields defined in the collection **template** plus any other field that the specific file has saved. You can add any arbitrary field to a post using the **new field** button and delete any field from the document using the **delete field** button.

The editor below the frontmatter fields supports **GitHub Flavored Markddown** with all its features. You can write markdown in the Editor tab and switch to the Preview tab immediately to see how your content will look. Your edits and changes will be saved while you do not close the browser tab or navigate away.

The editor also supports emoji markup using the `:+1:` syntax

The editor also supports **image drag and drop**. When you drop an image into the editor, a Data URI will be created and a graphical placeholder will be shown for your image (original markdown image markup for data URIs will be too long to show)

### Source Code

In this view you can browse all the files in your repo, so you can know which routes to configure in the collection sections. The files here can be edited plain, as they are in the github repo. This lets you tweak little details in the code of your application not related to the content you are tracking in your collection. The interface is almost the same as the interface for editing markdown posts, and you can also delete individual files from here.

### Settings

Here you can edit the configuration for your project, how content is organized and what defaults field are added to every content collection 

#### Collection settings

This section contains a little description of the concept of collections. Clicking the list items will open a modal with the information of the collection. Clicking the _"new +"_ button will open the same modal for creating a new collection. There you can name your collection, select a folder from your repository and select a template from the available templates.

#### Template settings

This section contains a little description of the concept of templates. Clicking the list items will open a modal with the information of the templates. Clicking the _"new +"_ button will open the same modal for creating a new template. There you can name your template, and configure the fields that will be added when this template is used. When saved to the config file, templates have the following stucture:

```json
{
  "id": "blog",
  "name": "Blog",
  "fields": [
    {
      "name": "Tag",
      "field": "tag",
      "hidden": false,
      "default": ""
    },
    {
      "name": "Date",
      "field": "date",
      "hidden": false,
      "default": ""
    }
  ]
}
```

- The **id** field is created automatically as a slug created from the `name` field.
- The **name** field is the label that is displayed in the templates list.
- For every element in the **fields** array:
  - The **field** property is what identifies this element, the key that will added to the yaml frontmatter
  - The **name** property correspond to the **label** input in the modal and is the label that will be shown in the markdown post editor
  - The **hidden** property marks whether or not this field is displayed in the markdown post editor 
  - The **default** property holds the default value that will be asigned to this field when a post is created

#### Project settings

In this section you can edit your project title, and change the branch of the repository that your project is using.

#### Danger Zone

This is the section where you can delete your project and all related information to it. You can also mark to delete the configuration file stored in your repository, so editing in this platform leaves no trace in your repository.
