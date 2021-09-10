import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Producto,
  Imagen,
} from '../models';
import {ProductoRepository} from '../repositories';

export class ProductoImagenController {
  constructor(
    @repository(ProductoRepository)
    public productoRepository: ProductoRepository,
  ) { }

  @get('/productos/{id}/imagen', {
    responses: {
      '200': {
        description: 'Imagen belonging to Producto',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Imagen)},
          },
        },
      },
    },
  })
  async getImagen(
    @param.path.number('id') id: typeof Producto.prototype.id,
  ): Promise<Imagen> {
    return this.productoRepository.pertenece_a_producto(id);
  }
}
