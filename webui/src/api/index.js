import axios from 'axios'
const baseUrl = 'http://localhost:3000'

export function http (method, url, data, cbSuccess, cbError) {
    axios({
        method: method,
        url: baseUrl + url,
        data: data
    })
    .then(response => {
        if (cbSuccess) cbSuccess(response.data)
    })
    .catch(error => {
        if (cbError) cbError(error)
    })
}