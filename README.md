# data modelling 

    -> parent to child
    <-> embedding, child referencing  

    tours -> reviews 
    users -> review
    location <-> tours
    tours <-> users
    tours -> bookings
    users -> bookings

# api documentation

    https://documenter.getpostman.com/view/2054414/Szt8eq8B

    
# production
    sendgrid only works for production env, local uses mailtrap
    https://whispering-mountain-15129.herokuapp.com/

# deployment

    heroku login
    git commit -m "" && git push heroku master
    heroku config:set STRIPE_WEBHOOK_SECRET=yourkey
    heroku logs

# notes

    await query.explain() - look for executionstats and amount of document examined

    tourSchema.index({ price: 1, ratingsAverage: -1 });
    tourSchema.index({ slug: 1 });
    tourSchema.index({ startLocation: '2dsphere' });

    indexing consume rource on create and update. Have to compare frequency of read write ratio before creating index