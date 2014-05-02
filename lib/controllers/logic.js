
exports.convertToResults = function(entityWithResults){
    var students = {};
    if (!entityWithResults || !entityWithResults.results ) {
        return students;
    }
    entityWithResults.results.forEach(function(item){
        students[item.studentId] = item;
    });
    return students;
};