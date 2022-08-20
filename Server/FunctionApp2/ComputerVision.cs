using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RestSharp;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Collections.Generic;
using System.Web.Http.Cors;
using System.Web.Http;
using System.Net.Http.Headers;
using Aliencube.AzureFunctions.Extensions.OpenApi.Core.Attributes;
using Aliencube.AzureFunctions.Extensions.OpenApi.Core.Enums;
using System.Net;
using Newtonsoft.Json.Linq;

namespace FunctionApp2
{

    [AttributeUsage(AttributeTargets.Method)]
    public sealed class SwaggerFormAttribute : Attribute
    {
        public string image { get; private set; }

        public SwaggerFormAttribute(string image)
        {
            this.image = image;
        }

    }
    public static class ComputerVision
    {
        [FunctionName("ComputerVision")]

        [OpenApiOperation(operationId: "ComputerVision",
                tags: new[] { "ComputerVision" },
                Summary = "",
                Description = "",
                Visibility = OpenApiVisibilityType.Important)]
        [OpenApiRequestBody(contentType: "application/json",
                bodyType: typeof(SwaggerFormAttribute),
                Required = true,
                Description = "")]

        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req,
            ILogger log)
        {


            //var imagurl2 = "https://plant.id/media/images/757562b36f1942209d4c96720967dfe8.jpg";
            //var imagurl = "C:/Users/danie/Downloads/mini_san_pedro.jpg";
            //FileStream fs = new FileStream(imagurl, FileMode.Open);
            //System.IO.BinaryReader br = new System.IO.BinaryReader(fs);
            //Byte[] bytes = br.ReadBytes((Int32)fs.Length);


            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic bodyjson = JsonConvert.DeserializeObject(requestBody);
            string base64image = bodyjson?.image;
            List<String> images = new List<string>();
            images.Add(base64image);

            var values = new Dictionary<string,List<string>>
            {
                {"images", images}
            };
            var json = JsonConvert.SerializeObject(values, Formatting.Indented);
            var data = new StringContent(json, Encoding.UTF8, "application/json");

            var url = "https://api.plant.id/v2/identify";
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Api-Key", "utvnqVbgOWEIZO61amWPgmCp7IbTWeT2B1EeoB2FLR1wAiFitP");
            client.DefaultRequestHeaders.Add("X-CSRFToken", "csrftoken");
            client.DefaultRequestHeaders.Add("mode", "same-origin");
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Add("Access-Control-Allow-Origin","*");

            try
            {
                var response = await client.PostAsync(url, data);
                string result = response.Content.ReadAsStringAsync().Result;
                var resultJson = (JObject)JsonConvert.DeserializeObject(result);
                return new OkObjectResult(resultJson["suggestions"][0]);
            } catch (Exception ex)
            {
                return new BadRequestObjectResult(ex.Message);
            }



        }
    }
}
