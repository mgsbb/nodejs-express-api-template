import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { type Express } from 'express';
import winstonLogger from '#src/utils/loggers/winston.logger';
import pinoLogger from '#src/utils/loggers/pino.logger';
import YAML from 'yamljs';

// UNUSED
import swaggerDocumentJSON from './swagger.json';

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

const swaggerDocumentYAML = YAML.load('./src/swagger/swagger.yaml');

function swaggerDocs(app: Express, port: number) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocumentYAML));

    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerDocumentYAML);
    });

    // winstonLogger.info(`Docs at http://localhost:${port}/docs`);
    pinoLogger.info(`Docs at http://localhost:${port}/docs`);
}

export default swaggerDocs;
