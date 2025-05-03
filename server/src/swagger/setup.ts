import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { type Express } from 'express';
import winstonLogger from '#src/utils/loggers/winston.logger';

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

const swaggerSpecification = swaggerJSDoc(options);

function swaggerDocs(app: Express, port: number) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecification));

    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpecification);
    });

    winstonLogger.info(`Docs at http://localhost:${port}/docs`);
}

export default swaggerDocs;
