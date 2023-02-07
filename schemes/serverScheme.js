import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create instance of Schema
var ServerScheme = new Schema({
    identifier: {
        type: String,
    },
    serverId: {

    },
    endpoints: {
        tcp: {
          address: {
              type: String,
          },
          port: {
          }
        },
        http: {
            address: {
                type: String,
            },
            port: {
            }
        }
    },
    url: {

    },
    clientId: {
        type: String,
    },
    versionData: {

    },
    settings: {

    },
    lastConnection: {
        type: Date,
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
});

ServerScheme.set('toJSON', { virtuals: true, getters: true });

export default mongoose.model('Server', ServerScheme);
