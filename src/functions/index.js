const { app } = require("@azure/functions");
const visionApiHandler = require("./visionAPIHandler");

app.http('status', {
    route: "status",
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        const name = request.query.get('name') || await request.text() || 'world';
        return { body: `Hello, ${name}!` };
    }
});

app.http('vision-api', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: visionApiHandler
});
