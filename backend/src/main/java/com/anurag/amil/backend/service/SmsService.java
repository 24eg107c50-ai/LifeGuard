package com.anurag.amil.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromNumber;

    public void sendSms(String mobile, String message) {

        if (accountSid.isBlank()
                || authToken.isBlank()
                || fromNumber.isBlank()) {

            throw new IllegalStateException(
                    "Twilio credentials are not configured."
            );
        }

        Twilio.init(accountSid, authToken);

        Message.creator(
                new PhoneNumber(mobile),
                new PhoneNumber(fromNumber),
                message
        ).create();
    }
}