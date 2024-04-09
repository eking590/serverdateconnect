import mongoose, { Schema, Document, Model } from 'mongoose';

const OtpSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: false },
    verified: { type: Boolean, default: false },

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

// Set expiresAt to 30 minutes from createdAt
OtpSchema.pre('save', function (next) {
    const now = new Date();
    if (!this.expiresAt) {
        this.expiresAt = new Date(now.getTime() + 30 * 60000); // 30 minutes in milliseconds
    }
    next();
});

// Middleware to remove OTPs associated with a user when the user is removed
OtpSchema.pre('remove', async function (next) {
    try {
        await this.model('Otp').deleteMany({ userId: this.userId });
        next();
    } catch (error) {
        next(error);
    }
});

const Otp = mongoose.model('Otp', OtpSchema);
export default Otp;
