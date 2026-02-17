import { gql } from "@apollo/client";

/******************
 *    MEMBERS    *
 *****************/

export const UPDATE_MEMBERS_BY_ADMIN = gql`
  mutation UpdateMemberByAdmin($input: MemberUpdate!) {
    updateMemberByAdmin(input: $input) {
      _id
      memberNick
      memberType
      memberStatus
      memberPhone
      memberImage
      memberGender
      isActive
      lastLogin
      bloodGroup
      allergies
      chronicDiseases
      doctorProfile
      createdAt
      updatedAt
      accessToken
    }
  }
`;

/******************
 *    DOCTORS    *
 *****************/

export const UPDATE_DOCTORS_BY_ADMIN = gql`
  mutation UpdateDoctorByAdmin($input: DoctorUpdate!) {
    updateDoctorByAdmin(input: $input) {
      _id
      memberNick
      memberStatus
      memberFullName
      memberPhone
      memberDesc
      licenseNumber
      specialization
      experience
      consultationFee
      memberType
      memberGender
      languages
      memberImage
      accessToken
      clinicAddress
      clinicName
      workingDays
      workingHours
      breakTime
      doctorViews
      reviewCount
      createdAt
      updatedAt
    }
  }
`;

/*********************
 *    APPOINTMENT    *
 ********************/

export const UPDATE_APPOINTMENTS_BY_ADMIN = gql`
  mutation UpdateAppointmentByAdmin($input: AppointmentUpdate!) {
    updateAppointmentByAdmin(input: $input) {
      _id
      patient
      doctor
      appointmentDate
      consultationType
      status
      reason
      symptoms
      notes
      consultationFee
      paymentStatus
      paidAt
      meetingLink
      meetingId
      followUpDate
      cancelledBy
      cancellationReason
      cancelledAt
      reminderSent
      completedAt
      duration
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_APPOINTMENT_BY_ADMIN = gql`
  mutation RemoveAppointmentByAdmin($input: String!) {
    removeAppointmentByAdmin(appointmentId: $input) {
      _id
      patient
      doctor
      appointmentDate
      consultationType
      status
      reason
      symptoms
      notes
      consultationFee
      paymentStatus
      paidAt
      meetingLink
      meetingId
      followUpDate
      cancelledBy
      cancellationReason
      cancelledAt
      reminderSent
      completedAt
      duration
      createdAt
      updatedAt
      timeSlot {
        start
        end
      }
      patientData {
        _id
        memberNick
        memberType
        memberStatus
        memberPhone
        memberImage
        memberGender
        memberArticles
        memberFollowers
        memberFollowings
        memberComments
        memberWarnings
        memberBlocks
        isActive
        lastLogin
        bloodGroup
        allergies
        chronicDiseases
        doctorProfile
        createdAt
        updatedAt
        accessToken
        memberAddress {
          street
          city
          state
          country
          zipCode
          coordinates {
            lat
            lng
          }
        }
        emergencyContact {
          name
          relationship
          phone
        }
      }
      doctorData {
        _id
        memberNick
        memberFullName
        memberPhone
        memberDesc
        memberArticles
        memberFollowers
        memberFollowings
        memberComments
        memberWarnings
        memberBlocks
        licenseNumber
        specialization
        experience
        consultationFee
        memberType
        memberGender
        languages
        memberImage
        accessToken
        clinicAddress
        clinicName
        workingDays
        workingHours
        breakTime
        doctorViews
        reviewCount
        createdAt
        updatedAt
      }
    }
  }
`;

/******************
 *    PAYMENTS    *
 *****************/

export const REFUND_BY_ADMIN = gql`
  mutation RefundByAdmin($input: RefundByAdminInput!) {
    refundByAdmin(input: $input) {
      _id
      appointment
      patient
      doctor
      amount
      platformFee
      doctorAmount
      paymentMethod
      status
      refundRequestReason
      refundRequestedAt
      refundedBy
      refundReason
      refundedAt
      paidAt
      createdAt
      updatedAt
    }
  }
`;

/******************
 *    ARTICLES    *
 *****************/

export const UPDATE_BOARD_ARTICLES_BY_ADMIN = gql`
  mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
    updateBoardArticleByAdmin(input: $input) {
      _id
      articleCategory
      articleStatus
      articleTitle
      articleContent
      articleImage
      articleViews
      articleLikes
      articleComments
      memberId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_BOARD_ARTICLES_BY_ADMIN = gql`
  mutation RemoveBoardArticleByAdmin($input: String!) {
    removeBoardArticleByAdmin(articleId: $input) {
      _id
      articleCategory
      articleStatus
      articleTitle
      articleContent
      articleImage
      articleViews
      articleLikes
      articleComments
      memberId
      createdAt
      updatedAt
    }
  }
`;

/******************
 *    COMMENTS    *
 *****************/

export const REMOVE_COMMENTS_BY_ADMIN = gql`
  mutation RemoveCommentByAdmin($input: String!) {
    removeCommentByAdmin(commentId: $input) {
      _id
      commentStatus
      commentGroup
      commentContent
      commentRefId
      parentCommentId
      commentReplies
      commentLikes
      memberId
      createdAt
      updatedAt
    }
  }
`;

/******************
 *     NOTICES    *
 *****************/

export const CREATE_NOTICE = gql`
  mutation CreateNotice($input: NoticeInput!) {
    createNotice(input: $input) {
      _id
      title
      content
      status
      target
      authorId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_NOTICE_BY_ADMIN = gql`
  mutation UpdateNoticeByAdmin($input: UpdateNoticeInput!) {
    updateNoticeByAdmin(input: $input) {
      _id
      title
      content
      status
      target
      authorId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_NOTICE_BY_ADMIN = gql`
  mutation RemoveNoticeByAdmin($input: String!) {
    removeNoticeByAdmin(noticeId: $input) {
      _id
      title
      content
      status
      target
      authorId
      createdAt
      updatedAt
    }
  }
`;
