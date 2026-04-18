const BACKEND_URL = "http://localhost:8085";

const paths = [
  "/appConfig",
  "/applicationProgress",
  "/authPermissions",
  "/businessGroup",
  "/businessGroupPermission",
  "/campaignCrud",
  "/candidateAsk",
  "/candidateInterview",
  "/candidateToken",
  "/api",
  "/decisions",
  "/emailTemplate",
  "/emailVerificationToken",
  "/entityPermission",
  "/files",
  "/interviewParticipant",
  "/invitationCode",
  "/legalText",
  "/notifications",
  "/pipelineStage",
  "/pipelineTemplate",
  "/smtpConfig",
  "/sourceToken",
  "/systemRolePermission",
  "/userPermissionOverride",
  "/userBusinessGroup",
  "/question",
  "/answer",
  "/form",
  "/formversion",
  "/formquestions",
  "/candidateanswer",
  "/user",
  "/specialities",
  "/departments",
  "/userManager",
  "/campaigns",
  "/interviews",
  "/applications",
  "/evaluations",
];

const proxy = {};
for (const path of paths) {
  proxy[path + "/**"] = {
    target: BACKEND_URL,
    secure: false,
    changeOrigin: true,
    logLevel: "debug",
  };
}

module.exports = proxy;
