class APIFeatures {
    constructor(queryString, query){
        this.queryString = queryString
        this.query = query
    }

    filter() {
        const queryObj = {...this.queryString}
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach( el => delete queryObj[el]);

        // implement advanced filtering for gt,gte,lt,lte
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        console.log(JSON.parse(queryStr));
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort(){
        if(this.queryString.sort){
            let sortBy = this.queryString.sort.split(',').join(' ')
            console.log(sortBy)
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }
    limitFields(){
        if(this.queryString.fields){
            let fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this
    }
    paginate(){
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100; 
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit)
        return this
    }
}

module.exports = APIFeatures;
