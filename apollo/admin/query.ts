import { gql } from "@apollo/client";

/******************
 *    MEMBERS    *
 *****************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
  query GetAllMembersByAdmin($input: MembersInquiry!) {
    getAllMembersByAdmin(input: $input) {
      list {
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
  }
`;

/******************
 *    DOCTORS    *
 *****************/

export const GET_ALL_DOCTORS_BY_ADMIN = gql`
  query GetAllDoctorsByAdmin($input: DoctorsInquiry!) {
    getAllDoctorsByAdmin(input: $input) {
      list {
        _id
        memberNick
        memberFullName
        memberPhone
        licenseNumber
        specialization
        experience
        consultationFee
        memberType
        memberGender
        languages
        memberImage
        accessToken
        DoctorViews
        reviewCount
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

/*********************
 *    APPOINTMENT    *
 ********************/

export const GET_ALL_APPOINTMENTS_BY_ADMIN = gql`
  query GetAllAppointmentByAdmin($input: AllAppointmentsInquiry!) {
    getAllAppointmentByAdmin(input: $input) {
      list {
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
      metaCounter {
        total
      }
    }
  }
`;

/******************
 *    PAYMENTS    *
 *****************/

export const GET_ALL_PAYMENTS_BY_ADMIN = gql`
  query GetAllPaymentsByAdmin($input: PaymentsInquiry!) {
    getAllPaymentsByAdmin(input: $input) {
      list {
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
      metaCounter {
        total
      }
    }
  }
`;

/******************
 *    ARTICLES    *
 *****************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
  query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
    getAllBoardArticlesByAdmin(input: $input) {
      list {
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
      metaCounter {
        total
      }
    }
  }
`;

