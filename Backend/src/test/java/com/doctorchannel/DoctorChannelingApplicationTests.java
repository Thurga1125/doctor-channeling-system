package com.doctorchannel;

import com.doctorchannel.repository.AppointmentRepository;
import com.doctorchannel.repository.DoctorRepository;
import com.doctorchannel.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.mongo.MongoRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@EnableAutoConfiguration(exclude = {
    MongoAutoConfiguration.class,
    MongoDataAutoConfiguration.class,
    MongoRepositoriesAutoConfiguration.class
})
class DoctorChannelingApplicationTests {

    @MockBean
    private DoctorRepository doctorRepository;

    @MockBean
    private AppointmentRepository appointmentRepository;

    @MockBean
    private UserRepository userRepository;

    @Test
    void contextLoads() {
        // Verify that the Spring context loads successfully
    }
}
