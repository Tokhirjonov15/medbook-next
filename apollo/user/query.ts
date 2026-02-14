import { gql } from "@apollo/client";

/******************
 *    DOCTORS    *
 *****************/

export const GET_DOCTORS = gql`
  query GetDoctors($input: DoctorsInquiry!) {
    getDoctors(input: $input) {
      list {
        _id
        memberNick
        memberType
        memberPhone
        memberImage
        memberGender
        createdAt
        updatedAt
        accessToken
        memberFullName
        licenseNumber
        specialization
        experience
        consultationFee
        languages
        doctorViews
        reviewCount
        memberDesc
        memberArticles
        memberFollowers
        memberFollowings
        memberComments
        memberWarnings
        memberBlocks
        memberLikes
        clinicAddress
        clinicName
        workingDays
        workingHours
        breakTime
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
        memberStatus
      }
      metaCounter {
        total
      }
    }
  }
`;
