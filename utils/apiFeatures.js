class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //   1A) Filtering
    // Create a hardcopy from the queryString, queryString is the data we specify in the quesryString in the cause of filtering
    const queryObj = { ...this.queryString };
    // Create an array of the fields we want to execlude before quering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // Loop over the excluded array and delete each of them from the queryObj
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    // Convert the obj to a string
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    // else {
    //   this.query = this.query.sort('-createdAt');
    // }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
