package tech.synelia.quizapp.utils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.List;
import lombok.Data;

/**
 * BUSINESS factory
 *
 * @author Diomande Souleymane
 */
 
@Data
@Component
public class ParamsUtils {

	@Value("${url.appl}")
	private String urlAppl;

	@Value("${smtp.mail.adresse}")
	private String smtpLogin;
	//
	@Value("${url.admin}")
	private String urlAdmin;
	//
	@Value("${smtp.mail.host}")
	private String smtpHost;
	//
	@Value("${smtp.mail.port}")
	private Integer smtpPort;
	//
	@Value("${smtp.mail.adresse}")
	private String smtpMailAdresse;
	//
	@Value("${smtp.mail.password}")
	private String smtpPassword;
	//
	@Value("${api.sms.senderAddress}")
	private String smsSenderAddress;
	//
	@Value("${api.sms.contentType.key}")
	private String smsContentTypeKey;
	//
	@Value("${api.sms.contentType.value}")
	private String smsContentTypeValue;
	//
	@Value("${api.sms.header.authorization}")
	private String smsHeaderAuthorization;
	//
	@Value("${api.sms.bearer}")
	private String smsBearer;
	//
	@Value("${api.sms.token}")
	private String smsToken;
	//
	@Value("${api.sms.url}")
	private String smsUrl;
	//
	@Value("${parametre.dossier}")
	private String pathDossier;
	//
	@Value("${url.root}")
	private String rootFilesUrl;
	//
	@Value("${image.directory}")
	private String imageDirectory;
	//
	@Value("${textfile.directory}")
	private String textfileDirectory;
	//
	@Value("${video.directory}")
	private String videoDirectory;
	//
	@Value("${otherfile.directory}")
	private String otherfileDirectory;
	//
	@Value("${url.root}")
	private String urlRoot;
	//
	//
	@Value("${minio.bucket.name}")
	private String defaultBucketName;
	//
	@Value("${minio.default.folder}")
	private String defaultBaseFolder;

	@Value("${login.type}")
	private String loginType;

	@Value("${use.otp}")
	private String useOtp;
}
