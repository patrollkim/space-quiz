# Space Cadet

A self-contained space trivia quiz with instant answer feedback, interesting
facts, score tracking, and a review of missed answers. It supports keyboard
shortcuts, light and dark color schemes, and reduced-motion preferences.

**Play online:** https://patrollkim.github.io/space-quiz/

## Run locally

Open `index.html` directly in a browser. No dependencies or build step are needed:
the HTML, CSS, quiz data, and JavaScript all live in that file.

Alternatively, with Python installed, serve the repository root:

```sh
python -m http.server 8000
```

Then open http://localhost:8000/index.html.

## Tests

With Node.js 24 installed, run the existing tests:

```sh
node --test
```

## Deployment

The [GitHub Pages workflow](.github/workflows/pages.yml) runs the quiz tests on
pull requests targeting `main`. On pushes to `main` or manual runs from `main`,
it runs the tests, packages only `index.html`, and deploys it to GitHub Pages.
There is no compilation or dependency installation step.

In the repository's **Settings > Pages**, the build and deployment source must
be **GitHub Actions**. The deployment uses the `github-pages` environment and
the workflow's scoped `pages: write` and `id-token: write` permissions.
