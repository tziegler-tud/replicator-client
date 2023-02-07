import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// create instance of Schema
var SettingsScheme = new Schema({
    identifier: {
        type: String,
        required: true,
    },
});

SettingsScheme.set('toJSON', { virtuals: true, getters: true });

export default mongoose.model('Settings', SettingsScheme);
