const { v4: uuidv4, stringify: uuid2str } = require("uuid");
var mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      min: 1,
      max: 4,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      validate: {
        validator: (v) => {
          const re = /[a-zA-Z0-9]+\.(png|jpg|jpeg)/;
          return v && re.test(v);
        },
      },
    },
    detected_image: {
      type: String,
    },
    detected_result: {
      type: String,
    },
    _authorId: {
      type: mongoose.Schema.Types.UUID,
    },
    _id: {
      type: mongoose.Schema.Types.UUID,
      default: () => uuidv4(),
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

reportSchema.virtual("id").get(function () {
  return this._id.toString();
});

reportSchema.virtual("authorId").get(function () {
  console.log(this._authorId);
  return this._authorId.toString();
});

reportSchema.set("toObject", { virtuals: true });
reportSchema.set("toJSON", { virtuals: true });

const Reports = mongoose.model("reportSchema", reportSchema);

module.exports = Reports;
