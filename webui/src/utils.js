import moment from 'moment'


export const formatDate =  (dt, format='DD.MM.YYYY') => {
    return moment(dt, 'YYYY.MM.DD').format(format)
}