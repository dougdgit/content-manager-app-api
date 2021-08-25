
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

const path = require("path");
const pathToDataFile = path.resolve("./data.json");
const fs = require("fs");
const getResources = () => JSON.parse(fs.readFileSync(pathToDataFile));

app.use(express.json());

app.get("/", (request, response) => {
    response.send("Hello from Express: GET '/' request!");
})

app.get("/api/resources", (request, response) => {
    const resources = getResources();
    response.send(resources);
})

app.get("/api/activeresource", (request, response) => {
    const resources = getResources();
    const activeResource = resources.find(resource => resource.status === "active");
    response.send(activeResource);
})

app.get("/api/resources/:id", (request, response) => {
    const resources = getResources();
    const { id } = request.params;

    // one line shorthand callback function syntax
    const resource = resources.find(resource => resource.id === id);
    //  full syntax callback function
    /*const resource = resources.find((resource) => {
        resource.id === id;
        return (
            resource
        )
    });*/

    response.send(resource);
})

app.patch("/api/resources/:id", (request, response) => {
    const resources = getResources();
    const { id } = request.params;
    const index = resources.findIndex(resource => resource.id === id);
    const activeResource = resources.find(resource => resource.status === "active")

    if (resources[index].status === "complete") {
        return response.status(422).send("CANNOT UPDATE: Resource has been completed!");
    }

    resources[index] = request.body;

    // ======== Activation handling ====================
    if (request.body.status === "active") {
        if (activeResource) {
            return response.status(422).send("CANNOT ACTIVATE: Another resource is currently Active!");
        }
        resources[index].status = "active";
        resources[index].activationTime = new Date();
    }
    // ======== END Activation handling =================

    fs.writeFile(pathToDataFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return response.status(422).send("Failed to store data into the JSON file!");
        }
        return response.send("Successfully updated data to the JSON file!");
    })
})

app.post("/api/resources", (request, response) => {
    const resources = getResources();
    const resource = request.body;

    resource.createdAt = new Date();
    resource.status = "inactive";
    resource.id = Date.now().toString();
    resources.unshift(resource); // inserts at beginning of JSON file
    //resources.push(resource); // inserts at end of JSON file

    fs.writeFile(pathToDataFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return response.status(422).send("Failed to store data into the JSON file!");
        }
        return response.send("Successfully saved data to the JSON file!");
    })
})

app.listen(PORT, () => {
    console.log("Express Server listening on Port: " + PORT);
})
