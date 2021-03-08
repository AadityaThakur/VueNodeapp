<template lang="pug">
  .campaign
    div.heading.text-primary
      h3 Campaigns
    .row
      b-alert(variant='danger'  :show="showErorr !== null") {{showErorr}}
      div(style="max-height: 800px; width: 100%; overflow-y: auto;")
        .table.table-responsive
          thead
            tr
              th 
                | Campaign Name
              th 
                | Start Date
              th
                | End Date
              th
                | Targeting
          tbody
            tr(v-for="item in campaignData")
              td
                | {{item.name}}
              td
                | {{item.start_date | formatDate}}
              td
                | {{item.end_date | formatDate}}
              td.targetingTd
                .targetingDiv(v-if="'gender' in item.targeting")
                  | Gender
                  div(v-if="item.targeting.gender.length == 2")
                    =" "
                    span
                      | - All
                  div(v-else, v-for="gen in item.targeting.gender")
                    =" "
                    span
                      | - {{gen}}
                .targetingDiv(v-if="'customer_type' in item.targeting")
                  | Customer Type
                  div(v-for="type in item.targeting.customer_type")
                    =" "
                    span
                      | - {{type}}
</template>

<script>
import {http} from '../api'
export default {
  name: 'campaign',
  data() {
      return {
        campaignData: [],
        showErorr: null
      }
  },
  mounted () {
    this.get_campaign_data()
  },
  computed: {
  },
  methods: {
    get_campaign_data () {
      http('get', '/campaigns', null, (response) => {
        if (response.error && response.error !== '') {
          this.campaignData = []
          this.showErorr = 'Error: ' + response.error
        } else {
          this.campaignData = response.data
          this.showErorr = null
        }
      }, (error) => {
        this.campaignData = []
        this.showErorr = error
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
