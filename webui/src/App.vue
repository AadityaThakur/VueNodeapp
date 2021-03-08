<template lang="pug">
  #app.container-lg.min-vh-100
    .card
      .card-header.text-center
        h2 Welcome 
      .card-body
        .row
          .col-sm-6.text-right
            b-btn(variant="primary", @click="showCampaigns(true)")
              | Campaigns
          .col-sm-6
            b-btn(variant="primary", @click="showCampaigns(false)")
              | Campaign Status
        Campaign(v-if="showCampaings")
        CampaignStatus(v-if="showCampaignStatus")
</template>

<script>
import Campaign from './components/Campaign.vue'
import CampaignStatus from './components/CampaignStatus.vue'

export default {
  name: 'App',
  components: {
    Campaign,
    CampaignStatus
  },
  data() {
    return {
      showCampaings: false,
      showCampaignStatus: false,
      showAlert: false
    }
  },
  methods: {
    showCampaigns (value) {
      this.showCampaings = value
      this.showCampaignStatus = !value
    }
  }
}
</script>

<style>

</style>
