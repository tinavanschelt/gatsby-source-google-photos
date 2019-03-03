# Gatsby-Source-Google-Photos

A Gatsby source plugin for sourcing photos from specific albums in your Google Photos Library and creating `GooglePhoto` nodes.

## Install

`npm install --save gatsby-source-google-photos`

## How to use

## Caveats

I encountered a couple of limitations whilst patching this thing toghether.

1.  \***\*OAuth\*\***: The only way to authorize a Google Photos API request is via OAuth, that means that the user (you) has to grant access when the initial build is running.

2.  \***\*Filters\*\***: Currently, the Google Photos API does not support simultaneously specifing an albumId and a mediaType filter. Issue being tracked [here](https://issuetracker.google.com/issues/116541300). We get the mediaItems in a specific album and the filter out the photos afterwards.
