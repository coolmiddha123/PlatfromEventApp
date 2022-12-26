public with sharing class PublishPlatformEvents {
    @AuraEnabled
    public static void PublishPlatformEvent(String recordId, String objName){
        List<PlatformEvent__e> publishEvents = new List<PlatformEvent__e>();
        Map<String, Object> fieldToJSONMap = new Map<String, Object>();
        List<PlatformEventMapping__mdt> mappingsList = PlatformEventMapping__mdt.getall().values();
        String query = 'Select Id, ';
            for(Integer i=0 ; i < mappingsList.size(); i++) {
                if(mappingsList[i].SObject_API_Name__c == objName) {
                    query += mappingsList[i].Salesforce_Field_API_Name__c + ', ';
                }
            }
        query = query.removeEnd(', ')+' from '+objName +' where Id =: recordId';

        for(Sobject obj : Database.query(query)) {
            PlatformEvent__e platformEvent = new PlatformEvent__e();
            for(PlatformEventMapping__mdt actualMapping : mappingsList) {
                if(actualMapping.SObject_API_Name__c == objName) {
                        fieldToJSONMap.put(actualMapping.Salesforce_Platform_Event_JSONAttribute__c,
                        obj.get(actualMapping.Salesforce_Field_API_Name__c));
                }
                else
                {
                    continue;
                }
            }
            platformEvent.RecordId__c = obj.Id;
            platformEvent.RecordJSON__c = JSON.serializePretty(fieldToJSONMap);
            publishEvents.add(platformEvent);
        }
        System.debug('Publish Events: '+publishEvents);
        if(!publishEvents.isEmpty()) {
            Eventbus.publish(publishEvents);
        }   
    }
}
