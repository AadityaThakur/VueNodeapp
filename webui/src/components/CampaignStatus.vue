<template lang="pug">
  .campaign-status
    div.heading.text-primary
      h3 Gaps
    .row#gaps_div
      b-alert(variant='danger'  :show="showErorr !== null") {{showErorr}}
      div(style="max-height: 800px; width: 100%; overflow-y: auto;")
        .table.table-responsive
          thead
            tr
              th 
                | Time Period
              th 
                | Gap(s)
          tbody
            tr(v-for="item in prepareGaps()")
              td
                 | {{item.start | formatDate}} {{' - '}}   {{item.end | formatDate}}
              td
                | {{item.text}}
    div.heading.text-primary
      h3 Conflicts
    .row#conflicts_div
      b-alert(variant='danger'  :show="showErorr !== null") {{showErorr}}
      div(style="max-height: 800px; width: 100%; overflow-y: auto;")
        .table.table-responsive
          thead
            tr
              th 
                | Time Period
              th 
                | Campaigns
              th 
                | Conflict
          tbody
            tr(v-for="item in prepareConflicts()")
              td
                | {{item.start | formatDate}} {{' - '}}   {{item.end | formatDate}}
              td
                | {{item.camps.join(' and ')}}
              td
                | {{item.targetType + ': ' + item.type.join(',') + ' is assigned to two or more campaigns'}}
    
</template>

<script>
import {http} from '../api'
export default {
  name: 'campaign-status',
  data() {
      return {
        campaignStatusData: null,
        showErorr: null
      }
  },
  mounted () {
    this.get_campaign_status_data()
  },
  computed: {
  },
  methods: {
    get_campaign_status_data () {
      http('get', '/campaigns-status', null, (response) => {
        if (response.error && response.error !== '') {
          this.campaignStatusData = null
          this.showErorr = 'Error: ' + response.error
        } else {
          this.campaignStatusData = response.data
        }
      }, (error) => {
        this.campaignStatusData = null
        this.showErorr = error
      })
    },
    prepareConflicts () {
      let finalConflicts = this.perpareGenderConflicts().concat(this.perpareCustomerTypeConflicts())
      return finalConflicts.sort((a, b) => a.start > b.start)
    },
    perpareGenderConflicts () {
      let intersectionObj = {}
      if (!(this.campaignStatusData && this.campaignStatusData.conflicts)) return []
      for (const genderVal in this.campaignStatusData.conflicts.gender) {
        let conflictsArr = this.campaignStatusData.conflicts.gender[genderVal]
        for (let i = 0; i < conflictsArr.length; i++) {
          let obj = conflictsArr[i]
          obj['targetType'] = 'Gender'
          if ((obj.start+obj.end+obj.camps.join()) in intersectionObj) {
            intersectionObj[obj.start+obj.end+obj.camps.join()]['type'].push(genderVal)
          } else {
            intersectionObj[obj.start+obj.end+obj.camps.join()] = Object.assign({}, obj, {'type': [genderVal]})
          }
        }
      }
      return Object.values(intersectionObj)
    },
    perpareCustomerTypeConflicts () {
      let intersectionObj = {}
      if (!(this.campaignStatusData && this.campaignStatusData.conflicts)) return []
      for (const cusTypeVal in this.campaignStatusData.conflicts.customer_type) {
        let conflictsArr = this.campaignStatusData.conflicts.customer_type[cusTypeVal]
        for (let i = 0; i < conflictsArr.length; i++) {
          let obj = conflictsArr[i]
          obj['targetType'] = 'Customer Type'
          if ((obj.start+obj.end+obj.camps.join()) in intersectionObj) {
            intersectionObj[obj.start+obj.end+obj.camps.join()]['type'].push(cusTypeVal)
          } else {
            intersectionObj[obj.start+obj.end+obj.camps.join()] = Object.assign({}, obj, {'type': [cusTypeVal]})
          }
        }
      }
      return Object.values(intersectionObj)
    },
    prepareGaps () {
      let gapsArr = []
      if (!(this.campaignStatusData && this.campaignStatusData.gaps)) return gapsArr
      for (const period in this.campaignStatusData.gaps) {
        let obj = this.campaignStatusData.gaps[period]
        if ((obj['gender']).length > 0) {
          obj['text'] = 'Gender: ' + obj['gender'].join(', ') + ' is not assigned'
          gapsArr.push(obj)
        }
        if ((obj['customer_type']).length > 0) {
          let text = 'Customer Type: ' + obj.customer_type.join(', ') + ' is not assigned'
          gapsArr.push(Object.assign({}, obj, {'text': text}))
        }
      }
      return gapsArr.sort((a, b) => a.start > b.start)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
