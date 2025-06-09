import Joi from "joi";

const listingSchemaValidation = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().allow("").default("https://plus.unsplash.com/premium_photo-1726610747137-b1b28dee5b4b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDV8RnpvM3p1T0hONnd8fGVufDB8fHx8fA%3D%3D"),
    price: Joi.number().required().min(1000),
    location: Joi.string().required(),
    country: Joi.string().required(),
});

const reviewSchemaValidation = Joi.object({
    comment : Joi.string().required(),
    rating : Joi.number().required().min(1).max(5),
})
export {listingSchemaValidation ,reviewSchemaValidation};