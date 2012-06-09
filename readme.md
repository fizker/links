links
=====

A simple links-repository in Node.js. It comes with a handy web-client, as well
as a simple API for any other application to use.


Dependencies:
-------------

There are a few hard dependencies, that should be installed before running
this app:

1. [node.js / npm](http://nodejs.org) - They come together in a handy package.
2. [mongo db](http://mongodb.org) - The data storage for this app.


Proposed roadmap
----------------

This is a suggested roadmap. Anything not done yet is under the possibility of
being shifted around!

The version-numbers will be along the lines of `x.y.z`:

- `x` is the major version.
- `y` is the minor version.
- `z` is a relatively minor update to a minor version.

`x.y` also signifies milestones, and thus lists what features are expected to
be ready before work is begun on the next milestone. This does not mean that
all features will be ready at `x.y.0`, though.

- <s>0.1</s>: Basic functionality in place.
- <s>0.2</s>: Permanent storage (Mongo).
- <s>0.3</s>: First shot at client-side UI.
- <s>0.4</s>: Bookmarklets.
- 0.5: Authorization (users, walls between links).
    - <s>0.5.0</s>: Authentication in place for `/profile`. `/signup` and
        `/login` is functional.
    - <s>0.5.1</s>: Added support for cookies and signup.
    - 0.5.2: Auth on all link endpoints; user-wall on links.
    - 0.5.3: Auth on bookmarklet.
- 0.6: Server-deployment (heroku, mongohq?).
- 0.7: Client-side UX (backbone, ajax, etc).
- 0.8: One-page app (html routing, fallback to current model).
- 0.9: Client-side optimization (concatenation, minification, gzip, etc.).

- 1.0: All done
