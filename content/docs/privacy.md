---
title: Privacy
---

## Privacy

[[toc]]

This page describes what data is read and saved in the application, how is it used and how to delete it if necessary.


### Login data

Your login data will be used only to read the user name and profile picture for your user, which organizations the user belongs to and the code of the repositories that you link to projects in this app. These login credentials will also be used to publish updates to your content. No other information will be accesed, such as issues, PRs, discussions, actions or other keys and settings. For more specific information on how data from GitHub is accesed, you can check the [public source code](https://github.com/juandjara/pressunto/blob/master/app/lib/github.ts).


### Cookie data

When a login action is performed successfully, an access token is generated and the user name and email are fetched from the GitHub API. This data is stored inside a cookie in the cookie storage of the user's browser. This cookie is valid for 7 days, and can be revoked from github at any time using GitHub [applicattions settings page](https://github.com/settings/applications/), revoking the access from the `pressunto` app. Also, when a user logs out of the application, this cookie is deleted from the user's browser.


### Data saved in DB

When you create a project using the [New Project](/projects/new) page, this information is saved in a remote Redis database provided by the platform [Upstash](https://upstash.com).


### Configuration file

When you create a new project, apart from updating records in the DB, a configuration file with the name `pressunto.config.json` is commited and pushed to the selected branch of the selected GitHub repository, at the root folder, with the following content:

```json
{ "collections": [], "templates": [] }
```

This file stores the configureation for **collections** and **templates**, the data that *Press*unto usees for organizing your content.


### Deleting your data

Using the **danger zone** section of the [Settings](settings) page, all the stored information about a project can be deleted from the DB. All the records created or updated in the project creation phase will be reverted. The saved configuration file `pressunto.config.json` stored in the repository at the project creation time can also be deleted, leaving no trace of Pressunto in your repository as if it had never existed.

If you have any other request about your data being deleted you can send me an email at juanorigami (at) gmail.com
