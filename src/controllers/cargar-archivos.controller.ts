// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';




import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  HttpErrors, param, post,
  Request,
  requestBody,
  Response,
  RestBindings
} from '@loopback/rest';
import multer from 'multer';
import path from 'path';
import {Keys as llaves} from '../config/keys';
import {Imagen} from '../models';
import {ImagenRepository} from '../repositories';

export class CargarArchivosController {
  constructor(
    @repository(ImagenRepository)
    private ImagenRepository: ImagenRepository
  ) { }



  /**
   *
   * @param response
   * @param request
   */
  @post('/CargarImagenProducto/{id_producto}', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Función de carga de una imagen de un producto.',
      },
    },
  })
  async cargarImagenDelProducto(
      @inject(RestBindings.Http.RESPONSE) response: Response,
      @requestBody.file() request: Request,
      @param.path.number("id_producto") id_producto: number
    ): Promise<object | false> {
      const rutaImagenProducto = path.join(__dirname, llaves.carpetaImagenProducto);
      let res = await this.StoreFileToPath(rutaImagenProducto, llaves.nombreCampoImagenProducto, request, response, llaves.extensionesPermitidasIMG);
      if (res) {
        const nombre_archivo = response.req?.file?.filename;
        if (nombre_archivo) {
          let img = new Imagen();
          img.nombre = nombre_archivo;
          img.id_producto = id_producto;
          await this.ImagenRepository.save(img);
          return {filename: nombre_archivo};
        }
      }
      return res;
    }

  /**
   * Return a config for multer storage
   * @param path
   */
  private GetMulterStorageConfig(path: string) {
    var filename: string = '';
    const storage = multer.diskStorage({
      destination: function (req: any, file: any, cb: any) {
        cb(null, path)
      },
      filename: function (req: any, file: any, cb: any) {
        filename = `${Date.now()}-${file.originalname}`
        cb(null, filename);
      }
    });
    return storage;
  }

  /**
   * store the file in a specific path
   * @param storePath
   * @param request
   * @param response
   */
  private StoreFileToPath(storePath: string, fieldname: string, request: Request, response: Response, acceptedExt: string[]): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      const storage = this.GetMulterStorageConfig(storePath);
      const upload = multer({
        storage: storage,
        fileFilter: function (req: any, file: any, callback: any) {
          var ext = path.extname(file.originalname).toUpperCase();
          if (acceptedExt.includes(ext)) {
            return callback(null, true);
          }
          return callback(new HttpErrors[400]('El formato del archivo no es permitido.'));
        },
        limits: {
          fileSize: llaves.tamMaxImagenProducto
        }
      },
      ).single(fieldname);
      upload(request, response, (err: any) => {
        if (err) {
          reject(err);
        }
        resolve(response);
      });
    });
  }

}
