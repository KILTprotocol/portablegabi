Most certainly, you can the Portablegabi API in the browser.
But you have to make it compatible with the browser API first, e.g. by bundling it with webpack.
This example is a full show-case of how you could run Portablegabi code in your browser.

## General Setup

1.  Bundle your JavaScript or TypeScript file that runs all the, e.g. with `yarn webpack --entry <your_script_file> --out <desired_output_file>
2.  Include your `<desired_output_file>` into an HTML file, e.g. `<script src="<desired_output_file>"></script>`
3.  Serve both the HTML file as well as the Portablegabi NPM to a server of your choice, e.g. with [goexec](https://github.com/shurcooL/goexec) `goexec 'http.ListenAndServe(":8080", http.FileServer(http.Dir(".")))'`
4.  Navigate to the path and open your console

## Run our browser example

Just execute the following steps without any configuration.

1. Install Portablegabi and Webpack
   ```
   yarn install
   ```
2. Bundle with webpack:
   ```
   yarn webpack
   ```
3. Serve to a server of your choice, we recommend goexec:

```
goexec 'http.ListenAndServe(":8080", http.FileServer(http.Dir(".")))'
```

4. Open your browser and navigate to `localhost:8080`
5. Open your console to check for example execution
