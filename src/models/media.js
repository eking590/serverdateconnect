import mongoose, { Schema } from 'mongoose';

const MediaSchema = new Schema({
    link: {  type: String, required: true },
    mediaType: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamps: {
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
});

// Middleware to remove media associated with a user when the user is removed
MediaSchema.pre('remove', async function (next) {
    try {
        await this.model('Media').deleteMany({ userId: this.userId });
        next();
    } catch (error) {
        next(error);
    }
});

const Media = mongoose.model('Media', MediaSchema);
export default Media;
