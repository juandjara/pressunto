---
meta: { "title": "Privacy | Pressunto" }
---

## Privacy

This page describes what data is read and saved in the application, how is it used and how to delete it if necessary.


### Login data

Your login data will be used only to read the user name and profile picture, which organizations the user belongs to and to read and write code from the repositories (public or private). No other information will be accesed, such as issues, PRs, discussions, actions or other keys and settings.
For more information on how data from GitHub is accesed, you can check the [public source code](https://github.com/juandjara/pressunto/blob/master/app/lib/github.ts).


### Cookie data

When a login action is performed successfully, an access token is generated and the user name and email are fetched from the GitHub API. This data is stored inside a cookie in the cookie storage of the user's browser. The access token is valid forever, but the access can be revoked from github any time at the [applicattions settings page](https://github.com/settings/applications/) revoking the access from the pressunto app. Also, when a user logs out of the application, this cookie is deleted from the user's browser.


### Data saved in DB

When you create a project using the [New Project](/projects/new) page, two database operations are peformed. 
A record is created for the new project storing the selected GitHub repo, GitHub branch and project title. 
The record which stores the relation between an user and their list of projects is updated. 
This information is saved in a remote Redis database using the DBaaS [Upstash](https://upstash.com) free tier.


### Configuration file

Also, when you create a new project, apart from writing the DB, a configuration file called `pressunto.config.json` is commited and pushed to the root of selected GitHub repository. This file has the following content:

```json
{ "collections": [], "templates": [] }
```

This file is updated with a new commit and push with every action performed in the [Settings](settings) page when updating collections or templates.


### Deleting your data

Using the **danger zone** section of the [Settings](settings) page, the stored information about a project can be deleted from the DB. All the records created or updated in the project creation phase will be reverted. The saved configuration file `pressunto.config.json` stored in the repository at the project creation time can also be deleted, leaving no trace of Pressunto in your repository as if it had never existed.

If you have any other request about your data being deleted you can send me an email at juanorigami (at) gmail.com
