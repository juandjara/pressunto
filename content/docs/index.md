---
title: Documentation
---

## Documentation

[[toc]]

This page describes how to get the most of *Press*unto and how different pages work together.


### Inspiration

*Press*unto takes inspiration from other pre-existing sites like [Prose](https://prose.io), [Coisas](http://coisas.fiatjaf.com/) or [Siteleaf](https://siteleaf.com) in designing a editing experience that does not get in your way and preserves the original structure of your content. All editing is based on reads and writes to the GitHub API, proxied by the server hosting this site. The value added by this site resides on the seamless editing interface and unobtrusive models that are built on top.


### Login

![login_screenshot.png](https://raw.githubusercontent.com/juandjara/pressunto/master/content/images/login_screenshot.png) 

This is the screen you will see when you are not logged in with github. It also acts a landing page with a brief description of the platform values.

The yellow icon in the top part of the page is a button that can be used for changing the color theme from light to dark and viceversa.

In the selector below the introduction you can choose which type of github repos you want to list and edit, public repos only or public and private repos. This will only apply to repos where you have permission to push commits.

In the bottom part of the page, a transparency note acts as a cookie warning and as a resume for our privacy policy, explaining how your login data will be processed.


### Projects

![project_list_screenshots.png](https://raw.githubusercontent.com/juandjara/pressunto/master/content/images/project_list_screenshots.png) 

This page lists the github repos you have connected to *Press*unto, each with their assigned title. From this page you can connect more repos to the platform and access the ones you have already connected

### Edit link
*Press*unto has a special feature which lets you directly access the editor for a file just writing the repo and the file you want to the edit in the URL, without having to worry about the internal routing structure of the platform.

An example for directly accesing the editor for this very file would be

```
https://pressunto.fly.dev/edit
  ?repo=juandjara/pressunto
  &file=content/docs/index.md
```

This URL will point to the right page for editing your file with *Press*unto. This URL will redirect to the _new project page_ if you haven't already connected this repo with the platform. If the file you want to edit is inside a collection, it will redirect you to that collection, and if not, it will redirect you the source code view where you can edit the file raw.

### New Project

![new_project_screenshot.png](https://raw.githubusercontent.com/juandjara/pressunto/master/content/images/new_project_screenshot.png)

In this page you can create a new connection from a repo of yours to the platform. The repository selector will only list the repos where you have push permission. The branch field will make sure you select a correct branch for your repo and the title will appear at the top left of your screen in the project detail page.
When this connection is created, a _project_ will be stored in the platform DB contaning this info. When the _project_ is created, a template config file will be uploaded to the root of your repository with the name `pressunto.config.json` if it did not exists previosuly. Then, you will be redirected to the project details page.

### Project Detail

![main_screenshot.png](https://raw.githubusercontent.com/juandjara/pressunto/master/content/images/main_screenshot.png)

This is the main layout of the application, the page that contains the whole editing experience. The left sidebar contains links to every page of importance here.

The top most section is for your **collections**, the folders where you can organize your content (more on this later).

- The first link takes you the list of your collections, which is the first page you will see when loading a project.
- Below this link is one for every collection you have configured, to have them always accesible.
- The **media** page lists every binary file in your repository, in a grid view designed for images. It allows you to upload new images to your repo too.
- The source page shows every file in your repo in a _tree view_ designed for exploring your folders. Here you can edit every file that is text based with a basic editor. It is designed for making small tweaks to your layout files.
- The **settings** page is where all you configuration is handled. Your **templates**, **collections**, **media folder** and other project details are edited here.
- The **documentation** page links to this very document you are reading
- The **privacy_ page links to a small document about how data is stored in the platform and what can you do to delete it if you want.

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

You can also reorder the post list by clicking in the icon in the top right corner of the list with the two arrows. This works by writing a numeric `order` attribute to the frontmatter of every post in the list. This is saved all in only one commit to your repository. You can then later use this attribute in your website to sort the blog posts.

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

This section contains a little description of the concept of templates. Clicking the list items will open a modal with the information of the templates. Clicking the _"new +"_ button will open the same modal for creating a new template. There you can name your template, and configure the fields that will be added when this template is used. Like the collection detail screen, this modal also a list reorder feature that you can activate to sort the template fields to your liking. When saved to the config file, templates have the following stucture:

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
