import mongoose, { Schema, Document } from 'mongoose';

const UserSchema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    password: { type: String },
    displayname: { type: String, unique: true },
    about: { type: String, required: true },
    gpsLocation: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    lastSeen:{type:Date},
    interest: { type: [String], default: [] },
    pendingRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users',default: [] }],
    acceptedRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users',default: [] }],
    rejectedRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users',default: [] }],
    hasSameIntrest: { type: [mongoose.Schema.Types.ObjectId], ref: 'users', default: [] },
    notSameIntrest: { type: [mongoose.Schema.Types.ObjectId], ref: 'users', default: [] },
    isVerified: { type: Boolean, default: false },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    sexuality: { type: String, enum: ['Heterosexual', 'Homosexual', 'Bisexual', 'Other'],default: 'Heterosexual'},
    intention: { type: String, enum: ['Casual', 'Dating', 'Marrage'], default:'Casual' },
    category: { type: String, enum: ['Normal', 'Premium',  'Other'],default:'Normal' },
//    lookingFor: { type: String, enum: ['Friend', 'Partner', 'Networking', 'Other'] },
    age: {
        type: Date,
        validate: {
            validator: Date,
            message: 'Age must be a valid number',
        },
    },
    cardInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
}, { timestamps: true });

// Create a geospatial index on gpslocation.coordinates
UserSchema.index({ 'gpsLocation.coordinates': '2dsphere' });

const User = mongoose.model('User', UserSchema);
export default User;
