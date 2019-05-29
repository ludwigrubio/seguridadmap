package com.jalisco.seguridmap.web.rest;
import com.jalisco.seguridmap.repository.UserRepository;
import com.jalisco.seguridmap.security.AuthoritiesConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import java.net.*;
import java.io.*;

import javax.inject.Inject;


/**
 * Created by ludwig on 09/06/17.
 */
@RestController
@RequestMapping("/proxy")
public class WmsProxy {


    /**
     * GETWFService function
     * @params baseurl, mixFeatures, startIndex, typename
     * return String
     * */
    @RequestMapping(value="/getWFService", method=RequestMethod.GET, produces="text/plain")
    @Secured({AuthoritiesConstants.ADMIN, AuthoritiesConstants.INVESTIGADOR})
    @ResponseBody
    public String getWFService(@RequestParam("baseurl") String baseurl,
                               @RequestParam("maxFeatures") Integer maxFeatures,
                               @RequestParam("startIndex") Integer startIndex,
                               @RequestParam("typename") String typename) {

        URL url;
        String complement="?service=WFS&version=1.1.0&request=GetFeature&srsName=EPSG:4326";
        String content = "";

            try {
                // get URL content
                url = new URL(baseurl+complement+"&maxFeatures="+maxFeatures+"&startIndex="+startIndex+"&typename="+typename);
                URLConnection conn = url.openConnection();

                // open the stream and put it into BufferedReader
                BufferedReader br = new BufferedReader(
                    new InputStreamReader(conn.getInputStream()));

                String inputLine;
                while ((inputLine = br.readLine()) != null) {
                    content += inputLine;
                }
                br.close();


            } catch (MalformedURLException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }


        return content;
    }
    /**
     * GETWFSCountFeatures function
     * @params baseurl, typename
     * return String
     * */
    @RequestMapping(value="/getWFSCountFeatures", method=RequestMethod.GET, produces="text/plain")
    @Secured({AuthoritiesConstants.ADMIN, AuthoritiesConstants.INVESTIGADOR})
    @ResponseBody
    public String getWFSCountFeatures(@RequestParam("baseurl") String baseurl,
                                      @RequestParam("typename") String typename) {

        URL url;
        String complement="?request=GetFeature&version=1.1.0&resultType=hits";
        String content = "";

        try {
            // get URL content
             baseurl = baseurl.replace("/wms", "/wfs");
            url = new URL(baseurl+complement+"&typeName="+typename);
            URLConnection conn = url.openConnection();

            // open the stream and put it into BufferedReader
            BufferedReader br = new BufferedReader(
                new InputStreamReader(conn.getInputStream()));

            String inputLine;
            while ((inputLine = br.readLine()) != null) {
                content += inputLine;
            }
            br.close();


        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return content;
    }

    /**
     * GetWFSProperties function
     * @params baseurl, typename
     * return String
     * */
    @RequestMapping(value="/GetWFSProperties", method=RequestMethod.GET, produces="text/plain")
    @Secured({AuthoritiesConstants.ADMIN, AuthoritiesConstants.INVESTIGADOR})
    @ResponseBody
    public String GetWFSProperties(@RequestParam("baseurl") String baseurl,
                                      @RequestParam("typename") String typename) {

        URL url;
        String complement="?version=1.1.0&request=describeFeatureType&outputFormat=application/json&service=WFS";
        String content = "";

        try {
            // get URL content
            baseurl = baseurl.replace("/wms", "/wfs");
            url = new URL(baseurl+complement+"&typeName="+typename);
            URLConnection conn = url.openConnection();

            // open the stream and put it into BufferedReader
            BufferedReader br = new BufferedReader(
                new InputStreamReader(conn.getInputStream()));

            String inputLine;
            while ((inputLine = br.readLine()) != null) {
                content += inputLine;
            }
            br.close();


        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return content;
    }
}


