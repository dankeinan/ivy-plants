using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.EventHubs;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using Newtonsoft.Json;
using Azure.Data.Tables;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;

namespace FunctionApp2
{
    public class MessageReceiver
    {
        private static readonly HttpClient client = new HttpClient();

        [FunctionName("MessageReceiver")]
        public async Task Run(
           [EventHubTrigger("event-hub-dnd-entity", Connection = "EVENT_HUB_CONNECTION_STRING")] EventData events,
           [SignalR(HubName = "serverless")] IAsyncCollector<SignalRMessage> signalRMessages,
            ILogger log)
        {
            var exceptions = new List<Exception>();
                try
                {
                    log.LogInformation("new event: ");

                    string messageBody = Encoding.UTF8.GetString(events.Body.Array, events.Body.Offset, events.Body.Count);      
                    String[] telemetry = messageBody.Split('?');
                    var msvalue = telemetry[0];
                    log.LogInformation("msvalue: "+msvalue);
                    var sensorID = telemetry[1];
                    log.LogInformation("sensorID: "+sensorID);

                    var tableClient = new TableClient(
                    new Uri("http://storageaccountdnd.table.core.windows.net/"),
                    "Telemetry",
                    new TableSharedKeyCredential("storageaccountdnd", "azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw=="));
                    string Dnow = DateTime.Now.ToString();
                    string Dnow2 = Dnow.Replace("/","");
                    Dnow2 = Dnow2.Replace(" ", "");
                    Dnow2 = Dnow2.Replace(":", "");
                    log.LogInformation("datetime: " + Dnow);

                    TableEntity tableEntity = new TableEntity(sensorID, Dnow2);
                    tableEntity.Add("moisture", msvalue);
                    tableEntity.Add("sensorID", sensorID);
                    tableEntity.Add("Timestamp", Dnow);

                    await tableClient.AddEntityAsync(tableEntity);

                var sensorClient = new TableClient(
                new Uri("http://storageaccountdnd.table.core.windows.net/"),
                "Sensor",
                new TableSharedKeyCredential("storageaccountdnd", "azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw=="));


                Azure.AsyncPageable<TableEntity> sensorUser = sensorClient.QueryAsync<TableEntity>(filter: $"sensorID eq '{sensorID}'");
                string target = "";
                string plantID = "";

                await foreach (TableEntity u in sensorUser)
                {
                    target = u.GetString("userID");
                    plantID = u.GetString("plantID");
                }
                log.LogInformation("userID: " + target);
                log.LogInformation("plantID: " + plantID);

                var plantClient = new TableClient(
                new Uri("http://storageaccountdnd.table.core.windows.net/"),
                "Plant",
                new TableSharedKeyCredential("storageaccountdnd", "azlF87V+w77xIHjmnqohQxqMdJUArE8cRQxRh9rn0pSwySZr2wwUfhHOdbvUVzJbUEYoj9e7FfJt+AStqNW6Nw=="));
                Azure.AsyncPageable<TableEntity> plantUser = plantClient.QueryAsync<TableEntity>(filter: $"plantID eq '{plantID}'");
                string idealMoisture = "";
                var plantName = "";
                await foreach (TableEntity i in plantUser)
                {
                    idealMoisture = i.GetString("moisture");
                    if (int.Parse(msvalue) != 0)
                    {
                        TableEntity j = i;
                        j["lastSample"] = msvalue;
                        plantName = i["plantName"].ToString();

                        await plantClient.UpsertEntityAsync(j);

                    }


                }
                log.LogInformation("moisture: " + idealMoisture);

                string notify = "";
                if (int.Parse(msvalue) != 0)
                {
                    if (int.Parse(idealMoisture) < int.Parse(msvalue) + 150)
                    {
                        notify = "1";
                    }
                    if (int.Parse(idealMoisture) > int.Parse(msvalue) + 150)
                    {
                        notify = "-1";
                    }
                    if ((int.Parse(idealMoisture) <= int.Parse(msvalue) + 150) && (int.Parse(idealMoisture) >= int.Parse(msvalue) - 150))
                    {
                        notify = "0";
                    }
                }
                else 
                {
                    notify = "bad smaple";
                }
                log.LogInformation("notify: " + notify);

                await signalRMessages.AddAsync(
                new SignalRMessage
                {
                        // the message will be sent to the group with this name
                        //GroupName = "myGroup",
                    Target = target,
                    Arguments = new[] { notify+":"+plantID+":"+plantName +":"+msvalue}//exmpale = {150:"too dry"}
                });


                // Replace these two lines with your processing logic.

                //var response = await client.GetAsync("https://functionapp220220419172755.azurewebsites.net/api/GetCounter");
                //var content = await response.Content.ReadAsStringAsync();
                //dynamic data = JsonConvert.DeserializeObject(content);
                //var counter = data?.counter;
                //log.LogInformation($"C# Event Hub trigger function processed a message: {response}");
                //await Task.Yield();
                //int num = Convert.ToInt32(counter) + 1;

                //await client.GetAsync($"https://functionapp220220419172755.azurewebsites.net/api/newupdate?value={num.ToString()}");


            }
            catch (Exception e)
                {
                    // We need to keep processing the rest of the batch - capture this exception and continue.
                    // Also, consider capturing details of the message that failed processing so it can be processed again later.
                    exceptions.Add(e);
                }
            

            // Once processing of the batch is complete, if any messages in the batch failed processing throw an exception so that there is a record of the failure.
            if (exceptions.Count > 1)
                throw new AggregateException(exceptions);

            if (exceptions.Count == 1)
                throw exceptions.Single();
        }
    }
}
