const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/vidriera_municipal')
  .then(async () => {
    const Comercio = require('./src/models/Comercio');
    const Perfil = require('./src/models/PerfilComerciante');
    const perfiles = await Perfil.find();
    let count = 0;
    for (const p of perfiles) {
      for (const cid of p.comerciosIds) {
        const result = await Comercio.updateOne(
          { _id: cid, propietarioId: { $exists: false } },
          { propietarioId: p.usuarioId }
        );
        if (result.modifiedCount > 0) count++;
      }
    }
    console.log('Orphan stores fixed:', count);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
