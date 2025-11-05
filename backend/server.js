// server.js - Backend Express con MongoDB
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const port = process.env.PORT || 3000;

// Configuración de MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'catalogo1';

let db;

// Conectar a MongoDB
async function connectDB() {
  try {
    const client = await MongoClient.connect(MONGO_URI);
    db = client.db(DB_NAME);
    console.log('✅ Conectado a MongoDB');
    console.log('📦 Base de datos:', DB_NAME);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentar límite para imágenes
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Función para construir el filtro de MongoDB desde los parámetros
function buildMongoFilter(params) {
  const filter = {};
  
  Object.keys(params).forEach((key) => {
    if (key === 'select' || key === 'order' || key === 'limit') return;

    const match = key.match(/(.+)\[(.+)\]/);
    if (match) {
      const field = match[1];
      const operator = match[2];
      let value = params[key];

      // Convertir 'id' string a ObjectId si es necesario
      if (field === 'id' || field === '_id' || field.endsWith('_id')) {
        try {
          value = new ObjectId(value);
          // Usar _id en lugar de id para MongoDB
          const mongoField = field === 'id' ? '_id' : field;
          
          switch (operator) {
            case 'eq':
              filter[mongoField] = value;
              break;
            case 'neq':
              filter[mongoField] = { $ne: value };
              break;
            case 'in':
              const inValues = params[key].split(',').map(id => {
                try {
                  return new ObjectId(id);
                } catch {
                  return id;
                }
              });
              filter[mongoField] = { $in: inValues };
              break;
          }
          return;
        } catch (e) {
          // Si no es un ObjectId válido, dejar como string
        }
      }

      switch (operator) {
        case 'eq':
          filter[field] = value;
          break;
        case 'neq':
          filter[field] = { $ne: value };
          break;
        case 'gt':
          filter[field] = { $gt: parseFloat(value) || value };
          break;
        case 'gte':
          filter[field] = { $gte: parseFloat(value) || value };
          break;
        case 'lt':
          filter[field] = { $lt: parseFloat(value) || value };
          break;
        case 'lte':
          filter[field] = { $lte: parseFloat(value) || value };
          break;
        case 'like':
          filter[field] = { $regex: value, $options: '' };
          break;
        case 'ilike':
          filter[field] = { $regex: value, $options: 'i' };
          break;
        case 'in':
          const inValues = value.split(',');
          filter[field] = { $in: inValues };
          break;
      }
    }
  });

  return filter;
}

// GET - Obtener documentos
app.get('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const filter = buildMongoFilter(req.query);
    
    console.log('📖 GET /', collection, 'Filter:', JSON.stringify(filter));
    
    let query = db.collection(collection).find(filter);

    // Order
    if (req.query.order) {
      const [field, direction] = req.query.order.split('.');
      const sortOrder = direction === 'desc' ? -1 : 1;
      query = query.sort({ [field]: sortOrder });
    }

    // Limit
    if (req.query.limit) {
      query = query.limit(parseInt(req.query.limit));
    }

    const results = await query.toArray();
    
    // Convertir _id a id para compatibilidad
    const formattedResults = results.map(doc => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: _id.toString()
      };
    });

    console.log(`✅ Encontrados ${formattedResults.length} documentos`);
    res.json(formattedResults);
  } catch (error) {
    console.error('❌ Error en GET:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener un documento por ID
app.get('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    
    console.log('📖 GET /', collection, '/', id);
    
    const document = await db.collection(collection).findOne({ _id: new ObjectId(id) });
    
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const { _id, ...rest } = document;
    const formattedResult = {
      ...rest,
      id: _id.toString()
    };

    console.log('✅ Documento encontrado');
    res.json(formattedResult);
  } catch (error) {
    console.error('❌ Error en GET by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Insertar documentos
app.post('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const data = req.body;
    
    console.log('📝 POST /', collection);
    
    // Agregar timestamps
    const timestamp = new Date().toISOString();
    
    // Soportar inserción múltiple
    const items = Array.isArray(data) ? data : [data];
    const itemsToInsert = items.map(item => {
      const { id, ...itemWithoutId } = item; // Remover id si viene
      return {
        ...itemWithoutId,
        created_at: item.created_at || timestamp
      };
    });

    const result = await db.collection(collection).insertMany(itemsToInsert);
    
    // Obtener los documentos insertados
    const insertedIds = Object.values(result.insertedIds);
    const inserted = await db.collection(collection)
      .find({ _id: { $in: insertedIds } })
      .toArray();

    // Convertir _id a id
    const formattedResults = inserted.map(doc => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: _id.toString()
      };
    });

    console.log(`✅ Insertados ${formattedResults.length} documentos`);
    res.json(Array.isArray(data) ? formattedResults : formattedResults[0]);
  } catch (error) {
    console.error('❌ Error en POST:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Actualizar documentos (con query parameters)
app.patch('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const updateData = req.body;
    const filter = buildMongoFilter(req.query);
    
    console.log('🔄 PATCH /', collection, 'Filter:', JSON.stringify(filter));
    console.log('📦 Update data:', JSON.stringify(updateData).substring(0, 200));
    
    // Remover campos que no deben actualizarse
    const { id, _id, created_at, ...dataToUpdate } = updateData;

    const result = await db.collection(collection).updateMany(
      filter,
      { $set: dataToUpdate }
    );

    console.log(`✅ Documentos actualizados: ${result.modifiedCount}`);

    // Obtener los documentos actualizados
    const updated = await db.collection(collection).find(filter).toArray();
    
    // Convertir _id a id
    const formattedResults = updated.map(doc => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: _id.toString()
      };
    });

    res.json(formattedResults);
  } catch (error) {
    console.error('❌ Error en PATCH:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Actualizar un documento por ID
app.patch('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const updateData = req.body;
    
    console.log('🔄 PATCH /', collection, '/', id);
    console.log('📦 Update data:', JSON.stringify(updateData).substring(0, 200));
    
    // Remover campos que no deben actualizarse
    const { id: _, _id, created_at, ...dataToUpdate } = updateData;

    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
      { $set: dataToUpdate }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    console.log(`✅ Documento actualizado (modificado: ${result.modifiedCount})`);

    // Obtener el documento actualizado
    const updated = await db.collection(collection).findOne({ _id: new ObjectId(id) });
    
    const { _id: mongoId, ...rest } = updated;
    const formattedResult = {
      ...rest,
      id: mongoId.toString()
    };

    res.json(formattedResult);
  } catch (error) {
    console.error('❌ Error en PATCH by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar documentos (con query parameters)
app.delete('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const filter = buildMongoFilter(req.query);
    
    console.log('🗑️ DELETE /', collection, 'Filter:', JSON.stringify(filter));
    
    // Obtener documentos antes de eliminarlos
    const toDelete = await db.collection(collection).find(filter).toArray();
    
    const result = await db.collection(collection).deleteMany(filter);
    
    console.log(`✅ Documentos eliminados: ${result.deletedCount}`);
    
    // Convertir _id a id
    const formattedResults = toDelete.map(doc => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: _id.toString()
      };
    });

    res.json(formattedResults);
  } catch (error) {
    console.error('❌ Error en DELETE:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar un documento por ID
app.delete('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    
    console.log('🗑️ DELETE /', collection, '/', id);
    
    // Obtener documento antes de eliminarlo
    const toDelete = await db.collection(collection).findOne({ _id: new ObjectId(id) });
    
    if (!toDelete) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
    
    console.log('✅ Documento eliminado');
    
    const { _id, ...rest } = toDelete;
    const formattedResult = {
      ...rest,
      id: _id.toString()
    };

    res.json(formattedResult);
  } catch (error) {
    console.error('❌ Error en DELETE by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.admin().ping();
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Iniciar servidor
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 API corriendo en http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`\n📚 Endpoints disponibles:`);
    console.log(`   GET    /api/:collection`);
    console.log(`   GET    /api/:collection/:id`);
    console.log(`   POST   /api/:collection`);
    console.log(`   PATCH  /api/:collection`);
    console.log(`   PATCH  /api/:collection/:id`);
    console.log(`   DELETE /api/:collection`);
    console.log(`   DELETE /api/:collection/:id`);
  });
});