![Fly Deploy](https://github.com/juandjara/pressunto/actions/workflows/main.yml/badge.svg)
![PRs welcome](https://img.shields.io/badge/PRs-welcome-green)

# Pressunto

Pressunto is a content editor for GitHub that does not get in your way designed for managing markdown files in static websites. It aims the simplest editing experience you could hope for while preserving your original content structure.

You can read more in the [Documentation](https://pressunto.fly.dev/docs)

## Running locally

To run this project on your local device, there is two options.

- You can use the provided Dockerfile (recommended for production)
- You can run the project with npm installing the node_modules (recommended for development)

The project requires the following environment variables to be configured:

|Env var   |Description   |
|---|---|
|SESSION_SECRET   | A random long string. Used internally for cookie session  |
|GITHUB_CLIENT_ID   | Client ID of your Github App. You can configure these in your [Github profile settings](https://github.com/settings/developers)   |
|GITHUB_CLIENT_SECRET   | Client Secret of your Github App  |
|REDIS_URL   | A working Redis URL. Used for caching and saving drafts  |

A sample `.env.example` is provided with these keys blank. You can copy this file to a `.env` file if you intend to run locally with npm. When running locally, the dev server will read this file and load environment variables from the `.env` file.

## Contributing

To contribute to this project, create a fork under your name, write you changes to a branch with a name relating your changes and send a Pull Request. You can read a more detailed guide [here](https://github.com/MarcDiethelm/contributing/blob/master/README.md).

Changes to the linter configuration and other architectural details and preferences (tabs, spaces, semicolons) won't be accepted without a strong argument but every PR will be read and discussed.
