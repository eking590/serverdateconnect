import User from "../../models/user.js";

class RecommendationClass {
  basicRecommendation = async (req, res) => {
    try {
      const userId = req.user?._id;

      const currentUser = await User.findById(userId, 'interest location hasSameIntrest pendingRequest acceptedRequest rejectedRequest gender sexuality age gpsLocation')
        .lean()
        .exec();

      const { hasSameIntrest, gpsLocation, age } = currentUser;

      const parsedDate = new Date(age);
      const maxAge = new Date(parsedDate);
      maxAge.setFullYear(parsedDate.getFullYear() + 5);

      let minAge = new Date(parsedDate);
      minAge.setFullYear(parsedDate.getFullYear() - 5);

      if (new Date().getFullYear() - minAge.getFullYear() < 18) {
        minAge.setFullYear(new Date().getFullYear() - 18);
      }

      const formattedMaxAge = maxAge.toISOString().split('T')[0];
      const formattedMinAge = minAge.toISOString().split('T')[0];

      const recommendedUsers = await User.find({
        _id: { $ne: userId, $nin: [...currentUser.pendingRequest, ...currentUser.acceptedRequest, ...currentUser.rejectedRequest] },
        pendingRequest: { $ne: userId },
        hasSameIntrest: { $ne: userId },
        acceptedRequest: { $ne: userId },
        rejectedRequest: { $ne: userId },
        gender: { $ne: currentUser.gender },
        sexuality: { $in: currentUser.sexuality },
        age: { $gte: formattedMinAge, $lte: formattedMaxAge },
        "gpsLocation.coordinates": {
          $near: {
            $geometry: { type: "Point", coordinates: gpsLocation.coordinates },
            $maxDistance: 80000, // 80km in meters
          },
        },
      }, '_id interest').lean().exec();
      if(recommendedUsers){
        const newIds = [...new Set(recommendedUsers.map(user => user._id))].filter(id => !hasSameIntrest.includes(id));

      await User.updateMany({ _id: userId }, { $push: { hasSameIntrest: { $each: newIds } } }).exec();

      const response = recommendedUsers.length >= 1 ? { data: recommendedUsers } : { msg: "No user found at this moment" };
      res.status(200).json(response);
      }else{
        res.status(404).json({
          msg:"No user Matches your profile please tweak your recommendation parameters"
        })
      }
      
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

const recommendationController = new RecommendationClass();
export default recommendationController;
