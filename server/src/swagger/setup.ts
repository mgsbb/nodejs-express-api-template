import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { type Express } from 'express';
import winstonLogger from '#src/utils/loggers/winston.logger';
import swaggerDocument from './swagger.json';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node ExpressJS Swagger API',
            version: '1.0.0',
            description: 'RestAPI template using ExpressJS',
        },
    },
    apis: ['./src/modules/v1/**/*.ts', './src/health/*.ts'],
};

// UNUSED
const swaggerSpecification = swaggerJSDoc(options);

function swaggerDocs(app: Express, port: number) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerDocument);
    });

    winstonLogger.info(`Docs at http://localhost:${port}/docs`);
}

export default swaggerDocs;
