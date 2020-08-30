
Current Progress:
Website:
    0 A few more tabs to do

AutoComplete Project:
    - Inspiration from https://towardsdatascience.com/a-list-of-beginner-friendly-nlp-projects-using-pre-trained-models-dc4768b4bec0
    - Cortex Installed from [here](https://github.com/cortexlabs/cortex/tree/master/examples/pytorch/search-completer) and [deployed](https://docs.cortex.dev/deployments/deployment).
    - Guide to help me write the JavaScript [Video](https://www.youtube.com/watch?v=uaa9HVC-tQA).
    - To avoid CORS issues, I proxied the Cortex API using local-cors-proxy via `sudo node /usr/local/bin/lcp --proxyUrl http://127.0.0.1:8888`. The proxy listens on `http://localhost:8010/proxy`
    - Example Proxy Call
        ```
        curl http://localhost:8010/proxy \
        -X POST -H "Content-Type: application/json -d '{"text": "donald trump is"}'
        ```
    - I strung it up to my website (Project 1), but there's a bit of cleaning up to do.
